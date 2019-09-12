import React, { useState, useEffect } from 'react';
import { Theme, Button, Modal, Avatar } from '@material-ui/core';
import { useParams } from 'hooks/routerHooks';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import Paper from '@material-ui/core/Paper';
import { JDCallPopover } from 'components/JuniorDoctors/JDCallPopover';
import Typography from '@material-ui/core/Typography';
import { useApolloClient } from 'react-apollo-hooks';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from 'graphql/types/createAppointmentSession';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from 'graphql/types/EndAppointmentSession';
import { UpdateCaseSheet, UpdateCaseSheetVariables } from 'graphql/types/UpdateCaseSheet';

import {
  CREATE_APPOINTMENT_SESSION,
  GET_CASESHEET,
  UPDATE_CASESHEET,
  END_APPOINTMENT_SESSION,
} from 'graphql/profiles';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from 'graphql/types/GetCaseSheet';
import { REQUEST_ROLES, STATUS } from 'graphql/types/globalTypes';
import { CaseSheet } from 'components/JuniorDoctors/JDCaseSheet/CaseSheet';
import { useAuth } from 'hooks/authHooks';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { ChatWindow } from 'components/JuniorDoctors/ChatWindow';
import Scrollbars from 'react-custom-scrollbars';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Relation } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import isNull from 'lodash/isNull';
import { parseISO, format } from 'date-fns';
import { Gender } from 'graphql/types/globalTypes';
import differenceInYears from 'date-fns/differenceInYears';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      paddingBottom: 20,
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      marginTop: 28,
      borderRadius: '0 0 5px 5px',
    },
    pageHeader: {
      backgroundColor: theme.palette.common.white,
      display: 'flex',
    },
    patientSection: {
      width: '50%',
      display: 'flex',
    },
    doctorSection: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 15,
    },
    patientImage: {
      paddingRight: 7,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    patientInfo: {
      padding: 15,
    },
    patientName: {
      fontSize: 22,
      fontWeight: 600,
      color: '#02475b',
      borderBottom: '1px solid #00b38e',
      '& span': {
        color: 'rgba(2, 71, 91, 0.6)',
      },
      marginBottom: 5,
    },
    patientTextInfo: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      '& label': {
        opacity: 0.8,
        color: '#02475b',
        fontSize: 12,
      },
    },
    doctorImg: {
      paddingRight: 12,
    },
    avatar: {
      width: 60,
      height: 60,
    },

    doctorInfo: {
      paddingRight: 55,
      fontWeight: 500,
    },
    assign: {
      fontSize: 12,
      color: '#02475b',
      opacity: 0.8,
    },
    doctorName: {
      fontSize: 16,
      color: '#01475b',
      paddingTop: 5,
    },
    doctorType: {
      fontSize: 10,
      opacity: 0.6,
      color: '#01475b',
      textTransform: 'uppercase',
      paddingTop: 2,
    },
    doctorContact: {
      color: '#0087ba',
      fontSize: 14,
      paddingTop: 8,
    },
    caseSheetBody: {
      paddingLeft: 74,
      paddingRight: 15,
    },
    chatBody: {
      paddingRight: 74,
    },
    contentGroup: {
      display: 'flex',
      paddingBottom: 30,
    },
    leftSection: {
      width: 'calc(50% - 1px)',
      borderRight: '1px solid rgba(2,71,91,0.2)',
    },
    rightSection: {
      width: '50%',
    },
    blockGroup: {
      width: '100%',
    },
    blockHeader: {
      boxShadow: '0 2px 10px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 12,
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
    },
    blockBody: {
      padding: '20px 5px 0 5px',
    },
    customScroll: {
      padding: '10px 25px',
    },
    boxGroup: {
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      padding: '30px 30px 10px 30px',
      marginBottom: 10,
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
      top: 0,
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: 'center',
      color: '#02475b',
      padding: '14px 10px',
      textTransform: 'none',
      width: '50%',
      opacity: 1,
      lineHeight: 'normal',
      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    modalBox: {
      maxWidth: 320,
      margin: 'auto',
      marginTop: 50,
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: '0 40px 20px 40px',
      position: 'relative',
      '& h3': {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 50,
        marginTop: 0,
        color: '#02475b',
      },
    },
    modalPdfBox: {
      maxWidth: '90%',
      height: '80%',
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
      position: 'relative',
    },
    tabHeader: {
      height: 30,
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
    },
    tabBody: {
      minHeight: 60,
      marginTop: '10px',
      padding: 15,
      '& p': {
        margin: 0,
        width: 180,
        fontSize: 16,
        fontWeight: 700,
        lineHeight: 1.4,
        color: '#01475b',
      },
    },
    tabPdfBody: {
      display: 'none',
      height: '100%',
      marginTop: '10px',
      paddingLeft: '15px',
      paddingTop: '10px',
      paddingRight: '15px',
      textAlign: 'center',
    },
    cross: {
      position: 'absolute',
      right: 0,
      top: '10px',
      fontSize: '18px',
      color: '#02475b',
    },
    consultButton: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      marginTop: 15,
      marginBottom: 25,
      width: '100%',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    cancelConsult: {
      width: '100%',
      fontSize: 14,
      padding: '8px 16px',
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
  };
});

type Params = { id: string; patientId: string };
const storageClient = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

export const JDConsultRoom: React.FC = () => {
  const classes = useStyles();
  const params = useParams<Params>();
  const paramId = params.id;

  const { currentPatient, isSignedIn } = useAuth();

  const doctorFirstName =
    currentPatient && currentPatient.firstName
      ? _startCase(_toLower(currentPatient.firstName))
      : '';
  const doctorLastName =
    currentPatient && currentPatient.lastName ? _startCase(_toLower(currentPatient.lastName)) : '';
  const doctorMobileNumber =
    currentPatient && currentPatient.mobileNumber
      ? _startCase(_toLower(currentPatient.mobileNumber))
      : '';
  const doctorSalutation =
    currentPatient && currentPatient.salutation
      ? _startCase(_toLower(currentPatient.salutation))
      : '';
  const doctorSpecialty =
    currentPatient && currentPatient.specialty && currentPatient.specialty.name
      ? _startCase(_toLower(currentPatient.specialty.name))
      : '';
  const doctorPhotoUrl =
    currentPatient && currentPatient.photoUrl ? _startCase(_toLower(currentPatient.photoUrl)) : '';

  //     setAppointmentId(paramId);
  //     setpatientId(params.patientId);
  //     setdoctorId(currentPatient.id);

  const [tabValue, setTabValue] = useState<number>(0);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [prescriptionPdf, setPrescriptionPdf] = useState<string>('');
  const [startConsult, setStartConsult] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>(paramId);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [appointmentDateTime, setappointmentDateTime] = useState<string>('');
  const [doctorId, setdoctorId] = useState<string>(currentPatient ? currentPatient.id : '');
  const [patientId, setpatientId] = useState<string>(params.patientId);
  const [caseSheetId, setCaseSheetId] = useState<string>('');
  const [casesheetInfo, setCasesheetInfo] = useState<any>(null);

  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };
  const client = useApolloClient();

  /* case sheet data*/
  const [symptoms, setSymptoms] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null
  >(null);
  const [diagnosis, setDiagnosis] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[] | null
  >(null);
  const [otherInstructions, setOtherInstructions] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions[] | null
  >(null);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[] | null
  >(null);
  const [medicinePrescription, setMedicinePrescription] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null
  >(null);

  const [notes, setNotes] = useState<string | null>(null);

  const [consultType, setConsultType] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<boolean[]>([]);
  const [caseSheetEdit, setCaseSheetEdit] = useState<boolean>(false);
  const [followUpAfterInDays, setFollowUpAfterInDays] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState<string[]>([]);
  const [isPdfPopoverOpen, setIsPdfPopoverOpen] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  /* case sheet data*/

  /* need to be worked later */
  let customNotes = '';
  const setCasesheetNotes = (notes: string) => {
    customNotes = notes; // this will be used in saving case sheet.
  };

  let genderString,
    appointmentDateIST = '';

  // retrieve patient details
  const patientFirstName =
    casesheetInfo && casesheetInfo!.getCaseSheet && casesheetInfo!.getCaseSheet!.patientDetails
      ? casesheetInfo!.getCaseSheet!.patientDetails.firstName
      : '';
  const patientLastName =
    casesheetInfo && casesheetInfo!.getCaseSheet && casesheetInfo!.getCaseSheet!.patientDetails
      ? casesheetInfo!.getCaseSheet!.patientDetails.lastName
      : '';
  const patientUhid =
    casesheetInfo && casesheetInfo!.getCaseSheet && casesheetInfo!.getCaseSheet!.patientDetails
      ? casesheetInfo!.getCaseSheet!.patientDetails.uhid
      : '';
  // const doctorId =
  //   casesheetInfo &&
  //   casesheetInfo.getCaseSheet &&
  //   casesheetInfo.getCaseSheet.caseSheetDetails &&
  //   casesheetInfo.getCaseSheet.caseSheetDetails.doctorId
  //     ? casesheetInfo.getCaseSheet.caseSheetDetails.doctorId
  //     : '';
  const patientRelation =
    casesheetInfo && casesheetInfo.getCaseSheet && casesheetInfo.getCaseSheet.patientDetails
      ? casesheetInfo.getCaseSheet.patientDetails.relation
      : '';
  const patientDob =
    casesheetInfo && casesheetInfo.getCaseSheet && casesheetInfo.getCaseSheet.patientDetails
      ? casesheetInfo.getCaseSheet.patientDetails.dateOfBirth
      : new Date();
  const patientAge = differenceInYears(new Date(), parseISO(patientDob));
  const patientGender =
    casesheetInfo && casesheetInfo.getCaseSheet && casesheetInfo.getCaseSheet.patientDetails
      ? casesheetInfo.getCaseSheet.patientDetails.gender
      : Gender.OTHER;

  if (Gender.FEMALE === patientGender) genderString = 'F';
  if (Gender.MALE === patientGender) genderString = 'M';
  if (Gender.OTHER === patientGender) genderString = 'O';

  const patientAppointmentId =
    (casesheetInfo &&
      casesheetInfo.getCaseSheet &&
      casesheetInfo.getCaseSheet.caseSheetDetails &&
      casesheetInfo.getCaseSheet.caseSheetDetails.appointment &&
      casesheetInfo.getCaseSheet.caseSheetDetails.appointment.displayId) ||
    '';
  const patientAppointmentTimeUtc =
    (casesheetInfo &&
      casesheetInfo.getCaseSheet &&
      casesheetInfo.getCaseSheet.caseSheetDetails &&
      casesheetInfo.getCaseSheet.caseSheetDetails.appointment &&
      casesheetInfo.getCaseSheet.caseSheetDetails.appointment.appointmentDateTime) ||
    '';
  const patientPhotoUrl =
    casesheetInfo &&
    casesheetInfo.getCaseSheet &&
    casesheetInfo.getCaseSheet.patientDetails &&
    !isNull(casesheetInfo.getCaseSheet.patientDetails.photoUrl)
      ? casesheetInfo.getCaseSheet.patientDetails.photoUrl
      : '';

  if (patientAppointmentTimeUtc !== '') {
    appointmentDateIST = format(
      new Date(patientAppointmentTimeUtc).getTime(),
      'dd-MM-yyyy hh:mm a'
    );
  }

  const patientRelationHeader =
    patientRelation === Relation.ME ? 'Self' : _startCase(_toLower(patientRelation));

  useEffect(() => {
    if (isSignedIn) {
      client
        .query<GetCaseSheet>({
          query: GET_CASESHEET,
          fetchPolicy: 'no-cache',
          variables: { appointmentId: appointmentId },
        })
        .then((_data) => {
          setCasesheetInfo(_data.data);
          setError('');
          _data!.data!.getCaseSheet!.caseSheetDetails!.diagnosis !== null
            ? setDiagnosis((_data!.data!.getCaseSheet!.caseSheetDetails!
                .diagnosis as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[])
            : setDiagnosis([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.symptoms
            ? setSymptoms((_data!.data!.getCaseSheet!.caseSheetDetails!
                .symptoms as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[])
            : setSymptoms([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.otherInstructions
            ? setOtherInstructions((_data!.data!.getCaseSheet!.caseSheetDetails!
                .otherInstructions as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions[])
            : setOtherInstructions([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.diagnosticPrescription
            ? setDiagnosticPrescription((_data!.data!.getCaseSheet!.caseSheetDetails!
                .diagnosticPrescription as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[])
            : setDiagnosticPrescription([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.medicinePrescription
            ? setMedicinePrescription((_data!.data!.getCaseSheet!.caseSheetDetails!
                .medicinePrescription as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[])
            : setMedicinePrescription([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.notes
            ? setNotes((_data!.data!.getCaseSheet!.caseSheetDetails!.notes as unknown) as string)
            : setNotes('');
          _data!.data!.getCaseSheet!.caseSheetDetails!.consultType
            ? setConsultType(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.consultType,
              ] as unknown) as string[])
            : setConsultType([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.followUp
            ? setFollowUp(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.followUp,
              ] as unknown) as boolean[])
            : setFollowUp([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.followUpAfterInDays
            ? setFollowUpAfterInDays(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.followUpAfterInDays,
              ] as unknown) as string[])
            : setFollowUpAfterInDays([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.followUpDate
            ? setFollowUpDate(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.followUpDate,
              ] as unknown) as string[])
            : setFollowUpDate([]);
          if (
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.caseSheetDetails &&
            _data.data.getCaseSheet.caseSheetDetails.appointment &&
            _data.data.getCaseSheet.caseSheetDetails.appointment.appointmentDateTime
          ) {
            //setappointmentDateTime('2019-08-27T17:30:00.000Z');
            setappointmentDateTime(
              _data.data.getCaseSheet.caseSheetDetails.appointment.appointmentDateTime
            );
          }
        })
        .catch((e: any) => {
          setError('Error occured in getcasesheet api');
          console.log('Error occured creating session', e);
        })
        .finally(() => {
          setLoaded(true);
        });
      return () => {
        console.log('in return...');
        const cookieStr = `action=`;
        document.cookie = cookieStr + ';path=/;';
      };
    }
  }, []);

  // useEffect(() => {
  //   if (appointmentId !== paramId && paramId !== '' && currentPatient && currentPatient.id !== '') {
  //     setAppointmentId(paramId);
  //     setpatientId(params.patientId);
  //     setdoctorId(currentPatient.id);

  //   }
  //   return () => {
  //     console.log('in return...');
  //     const cookieStr = `action=`;
  //     document.cookie = cookieStr + ';path=/;';
  //   };
  // }, [paramId, appointmentId]);

  const saveCasesheetAction = (flag: boolean) => {
    client
      .mutate<UpdateCaseSheet, UpdateCaseSheetVariables>({
        mutation: UPDATE_CASESHEET,
        variables: {
          UpdateCaseSheetInput: {
            symptoms: symptoms!.length > 0 ? JSON.stringify(symptoms) : null,
            notes: customNotes,
            diagnosis: diagnosis!.length > 0 ? JSON.stringify(diagnosis) : null,
            diagnosticPrescription:
              diagnosticPrescription!.length > 0 ? JSON.stringify(diagnosticPrescription) : null,
            followUp: followUp[0],
            followUpDate: followUp[0] ? new Date(followUpDate[0]).toISOString() : '',
            followUpAfterInDays:
              followUp[0] && followUpAfterInDays[0] !== 'Custom' ? followUpAfterInDays[0] : null,
            otherInstructions:
              otherInstructions!.length > 0 ? JSON.stringify(otherInstructions) : null,
            medicinePrescription:
              medicinePrescription!.length > 0 ? JSON.stringify(medicinePrescription) : null,
            id: caseSheetId,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (_data && _data!.data!.updateCaseSheet && _data!.data!.updateCaseSheet!.blobName) {
          console.log(_data!.data!.updateCaseSheet!.blobName);
          const url =
            'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/' +
            _data!.data!.updateCaseSheet!.blobName;
          setPrescriptionPdf(url);
        }
        if (!flag) {
          setIsPopoverOpen(true);
        }
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        alert(errorMessage);
        console.log('Error occured while update casesheet', e);
      });
  };

  const endConsultAction = () => {
    saveCasesheetAction(false);
    // client
    //   .mutate<UpdateCaseSheet, UpdateCaseSheetVariables>({
    //     mutation: UPDATE_CASESHEET,
    //     variables: {
    //       UpdateCaseSheetInput: {
    //         symptoms: symptoms!.length > 0 ? JSON.stringify(symptoms) : null,
    //         notes,
    //         diagnosis: diagnosis!.length > 0 ? JSON.stringify(diagnosis) : null,
    //         diagnosticPrescription:
    //           diagnosticPrescription!.length > 0 ? JSON.stringify(diagnosticPrescription) : null,
    //         followUp: followUp[0],
    //         followUpDate: followUp[0] ? new Date(followUpDate[0]).toISOString() : '',
    //         followUpAfterInDays:
    //           followUp[0] && followUpAfterInDays[0] !== 'Custom' ? followUpAfterInDays[0] : null,
    //         otherInstructions:
    //           otherInstructions!.length > 0 ? JSON.stringify(otherInstructions) : null,
    //         medicinePrescription:
    //           medicinePrescription!.length > 0 ? JSON.stringify(medicinePrescription) : null,
    //         id: caseSheetId,
    //       },
    //     },
    //     fetchPolicy: 'no-cache',
    //   })
    //   .then((_data) => {
    //     console.log('_data', _data);
    //     endConsultActionFinal();
    //   })
    //   .catch((e) => {
    //     console.log('Error occured while update casesheet', e);
    //   });
  };

  const endConsultActionFinal = () => {
    client
      .mutate<EndAppointmentSession, EndAppointmentSessionVariables>({
        mutation: END_APPOINTMENT_SESSION,
        variables: {
          endAppointmentSessionInput: {
            appointmentId: appointmentId,
            status: STATUS.COMPLETED,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        // setIsPopoverOpen(true);
        setIsPdfPopoverOpen(true);
        setIsEnded(true);
        console.log('_data', _data);
      })
      .catch((e) => {
        console.log('Error occured while End casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while End casesheet', errorMessage, error);
        alert(errorMessage);
      });
  };

  const createSessionAction = () => {
    client
      .mutate<CreateAppointmentSession, CreateAppointmentSessionVariables>({
        mutation: CREATE_APPOINTMENT_SESSION,
        variables: {
          createAppointmentSessionInput: {
            appointmentId: paramId,
            requestRole: REQUEST_ROLES.DOCTOR,
          },
        },
      })
      .then((_data: any) => {
        setsessionId(_data.data.createAppointmentSession.sessionId);
        settoken(_data.data.createAppointmentSession.appointmentToken);
        setCaseSheetId(_data.data.createAppointmentSession.caseSheetId);
        setError('');
      })
      .catch((e: any) => {
        setError('Error occured creating session');
        console.log('Error occured creating session', e);
      });
  };

  const setStartConsultAction = (flag: boolean) => {
    setStartConsult('');
    const cookieStr = `action=${flag ? 'videocall' : 'audiocall'}`;
    document.cookie = cookieStr + ';path=/;';
    setTimeout(() => {
      setStartConsult(flag ? 'videocall' : 'audiocall');
    }, 10);
  };
  return !loaded ? (
    <LinearProgress />
  ) : (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      {error && error !== '' && <Typography className={classes.tabRoot}>{error}</Typography>}
      {loaded && error === '' && (
        <CaseSheetContext.Provider
          value={{
            loading: !loaded,
            caseSheetId: appointmentId,
            patientDetails: casesheetInfo!.getCaseSheet!.patientDetails,
            appointmentInfo: casesheetInfo!.getCaseSheet!.caseSheetDetails!.appointment,
            symptoms,
            setSymptoms,
            notes,
            setNotes,
            diagnosis,
            setDiagnosis,
            otherInstructions,
            setOtherInstructions,
            diagnosticPrescription,
            setDiagnosticPrescription,
            medicinePrescription,
            setMedicinePrescription,
            consultType,
            setConsultType,
            caseSheetEdit,
            setCaseSheetEdit,
            followUp,
            setFollowUp,
            followUpAfterInDays,
            setFollowUpAfterInDays,
            followUpDate,
            setFollowUpDate,
            healthVault: casesheetInfo!.getCaseSheet!.patientDetails!.healthVault,
            pastAppointments: casesheetInfo!.getCaseSheet!.pastAppointments,
            setCasesheetNotes,
          }}
        >
          <div className={classes.container}>
            <div className={classes.pageContainer}>
              {/* patient and doctors details start */}
              <div className={classes.pageHeader}>
                <div className={classes.patientSection}>
                  <div className={classes.patientImage}>
                    <img
                      src={
                        patientPhotoUrl !== ''
                          ? patientPhotoUrl
                          : 'https://via.placeholder.com/132x132'
                      }
                      alt="Patient Profile Photo"
                    />
                  </div>
                  <div className={classes.patientInfo}>
                    <div className={classes.patientName}>
                      {patientFirstName} {patientLastName}
                      <span>
                        ({isNull(patientAge) ? patientAge : ''}, {patientGender})
                      </span>
                    </div>
                    <div className={classes.patientTextInfo}>
                      <label>UHID:</label> {patientUhid} | <label>Relation:</label>
                      {patientRelationHeader}
                    </div>
                    <div className={classes.patientTextInfo}>
                      <label>Appt ID:</label> {patientAppointmentId}
                    </div>
                    <div className={classes.patientTextInfo}>
                      <label>Appt Date:</label> {appointmentDateIST}
                    </div>
                  </div>
                </div>
                <div className={classes.doctorSection}>
                  <div className={classes.doctorImg}>
                    <Avatar
                      src={doctorPhotoUrl !== '' ? doctorPhotoUrl : require('images/doctor_02.png')}
                      alt="Doctor Profile Photo"
                      className={classes.avatar}
                    />
                  </div>
                  <div className={classes.doctorInfo}>
                    <div className={classes.assign}>Assigned to:</div>
                    <div
                      className={classes.doctorName}
                    >{`${doctorSalutation} ${doctorFirstName} ${doctorLastName}`}</div>
                    <div className={classes.doctorType}>{doctorSpecialty}</div>
                    <div className={classes.doctorContact}>{doctorMobileNumber}</div>
                  </div>
                </div>
              </div>
              {/* patient and doctors details end */}
              <JDCallPopover
                setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)}
                createSessionAction={createSessionAction}
                saveCasesheetAction={(flag: boolean) => saveCasesheetAction(flag)}
                endConsultAction={endConsultAction}
                appointmentId={appointmentId}
                appointmentDateTime={appointmentDateTime}
                doctorId={doctorId}
                isEnded={isEnded}
                caseSheetId={caseSheetId}
                prescriptionPdf={prescriptionPdf}
                sessionId={sessionId}
                token={token}
              />
              <div className={classes.contentGroup}>
                <div className={classes.leftSection}>
                  <div className={classes.blockGroup}>
                    <div className={classes.blockHeader}>Case Sheet</div>
                    <div className={`${classes.blockBody} ${classes.caseSheetBody}`}>
                      <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 440px' }}>
                        <div className={classes.customScroll}>
                          {casesheetInfo ? <CaseSheet /> : ''}
                        </div>
                      </Scrollbars>
                    </div>
                  </div>
                </div>
                <div className={classes.rightSection}>
                  <div className={classes.blockGroup}>
                    <div className={classes.blockHeader}>Chat</div>
                    <div className={`${classes.blockBody}`}>
                      <ChatWindow
                        startConsult={startConsult}
                        sessionId={sessionId}
                        token={token}
                        appointmentId={paramId}
                        doctorId={doctorId}
                        patientId={patientId}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CaseSheetContext.Provider>
      )}
      <Modal
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBox}>
          <div className={classes.tabHeader}>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setIsPopoverOpen(false)}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            {}
            <h3>
              You're ending your consult with{' '}
              {casesheetInfo &&
                casesheetInfo !== null &&
                casesheetInfo!.getCaseSheet!.patientDetails!.firstName &&
                casesheetInfo!.getCaseSheet!.patientDetails!.firstName !== '' &&
                casesheetInfo!.getCaseSheet!.patientDetails!.lastName &&
                casesheetInfo!.getCaseSheet!.patientDetails!.lastName !== '' && (
                  <span>
                    {` ${casesheetInfo!.getCaseSheet!.patientDetails!.firstName} ${
                      casesheetInfo!.getCaseSheet!.patientDetails!.lastName
                    }.`}
                  </span>
                )}
            </h3>
            <Button
              className={classes.consultButton}
              //disabled={startAppointmentButton}
              onClick={() => {
                setIsPopoverOpen(false);
                endConsultActionFinal();
                setCaseSheetEdit(false);
              }}
            >
              Preview Prescription
            </Button>
            <Button
              className={classes.cancelConsult}
              onClick={() => {
                setIsPopoverOpen(false);
              }}
            >
              Edit Case Sheet
            </Button>
          </div>
        </Paper>
      </Modal>

      {isEnded && (
        <div className={classes.tabPdfBody}>
          <iframe src={prescriptionPdf} width="80%" height="450"></iframe>
        </div>
      )}
    </div>
  );
};
