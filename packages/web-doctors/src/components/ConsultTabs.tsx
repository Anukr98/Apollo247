import React, { useState, useEffect, useContext } from 'react';
import { Theme, Button, Modal } from '@material-ui/core';
import { useParams } from 'hooks/routerHooks';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import Paper from '@material-ui/core/Paper';
import { CallPopover } from 'components/CallPopover';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { ConsultRoom } from 'components/ConsultRoom';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { useApolloClient } from 'react-apollo-hooks';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
// import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
import { CasesheetView } from 'components/CasesheetView';
import { APPOINTMENT_TYPE } from '../graphql/types/globalTypes';

//import { Document } from 'react-pdf';
import _omit from 'lodash/omit';

import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from 'graphql/types/CreateAppointmentSession';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from 'graphql/types/EndAppointmentSession';
import {
  UpdatePatientPrescriptionSentStatus,
  UpdatePatientPrescriptionSentStatusVariables,
} from 'graphql/types/UpdatePatientPrescriptionSentStatus';

import {
  CREATE_APPOINTMENT_SESSION,
  GET_CASESHEET,
  // UPDATE_CASESHEET,
  END_APPOINTMENT_SESSION,
  CREATE_CASESHEET_FOR_SRD,
  // GET_CASESHEET_JRD,
  MODIFY_CASESHEET,
  UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS,
} from 'graphql/profiles';

import { ModifyCaseSheet, ModifyCaseSheetVariables } from 'graphql/types/ModifyCaseSheet';

// import {
//   GetJuniorDoctorCaseSheet,
//   GetJuniorDoctorCaseSheetVariables,
// } from 'graphql/types/GetJuniorDoctorCaseSheet';

import { CircularProgress } from '@material-ui/core';

import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from 'graphql/types/GetCaseSheet';

import {
  CreateSeniorDoctorCaseSheet,
  CreateSeniorDoctorCaseSheetVariables,
} from 'graphql/types/CreateSeniorDoctorCaseSheet';

import { REQUEST_ROLES, STATUS, DOCTOR_CALL_TYPE, APPT_CALL_TYPE } from 'graphql/types/globalTypes';
import { CaseSheet } from 'components/case-sheet/CaseSheet';
import { useAuth } from 'hooks/authHooks';
import { CaseSheetContext } from 'context/CaseSheetContext';
import Scrollbars from 'react-custom-scrollbars';
import { useMutation } from 'react-apollo-hooks';
import { ApolloError } from 'apollo-client';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { clientRoutes } from 'helpers/clientRoutes';
import { SEND_CALL_NOTIFICATION } from 'graphql/consults';
import {
  SendCallNotification,
  SendCallNotificationVariables,
} from 'graphql/types/SendCallNotification';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultRoom: {
      paddingTop: 64,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 64,
      },
    },
    chatContainer: {
      minHeight: 'calc(100vh - 360px)',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      minHeight: 500,
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 0,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
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
    tabSelected: {
      fontWeight: theme.typography.fontWeightBold,
      color: '#02475b',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    DisplayNone: {
      display: 'none !important',
    },
    typography: {
      padding: theme.spacing(2),
    },
    pointerNone: {
      pointerEvents: 'none',
    },
    none: {
      display: 'none',
    },
    block: {
      display: 'block',
    },
    modalBox: {
      maxWidth: 320,
      // height: 250,
      margin: 'auto',
      marginTop: 50,
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: '0 20px 20px 20px',
      position: 'relative',
      '& h3': {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 30,
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
    loading: {
      position: 'absolute',
      left: '50%',
      top: '45%',
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
        // paddingBottom: 15,
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
      /* padding: 15px; */
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
      width: 110,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    cancelConsult: {
      width: 120,
      fontSize: 14,
      padding: '8px 16px',
      marginRight: 15,
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    popupDialog: {
      maxWidth: 320,
    },
    headingTxt: {
      fontSize: 20,
      color: '#02475b',
      fontWeight: 600,
    },
    contentTxt: {
      marginTop: 30,
      color: '#02475b',
      fontSize: 14,
    },
  };
});

type Params = { id: string; patientId: string; tabValue: string };
const storageClient = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

export const ConsultTabs: React.FC = () => {
  const classes = useStyles();
  const params = useParams<Params>();
  const paramId = params.id;

  const { currentPatient, isSignedIn } = useAuth();

  const mutationCreateSrdCaseSheet = useMutation<
    CreateSeniorDoctorCaseSheet,
    CreateSeniorDoctorCaseSheetVariables
  >(CREATE_CASESHEET_FOR_SRD, {
    variables: {
      appointmentId: paramId,
    },
  });

  // setAppointmentId(paramId);
  // setpatientId(params.patientId);
  // setdoctorId(currentPatient.id);

  const [tabValue, setTabValue] = useState<number>(
    params && params!.tabValue && params!.tabValue !== null && params!.tabValue !== ''
      ? parseInt(params!.tabValue, 10)
      : 0
  );
  const [urlToPatient, setUrlToPatient] = useState<boolean>(false);
  const [prescriptionPdf, setPrescriptionPdf] = useState<string>('');
  const [startConsult, setStartConsult] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>(paramId);
  const [isPdfPageOpen, setIsPdfPageOpen] = useState<boolean>(false);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [appointmentDateTime, setappointmentDateTime] = useState<string>('');
  const [doctorId, setdoctorId] = useState<string>(currentPatient ? currentPatient.id : '');
  const [patientId, setpatientId] = useState<string>(params.patientId);
  const [caseSheetId, setCaseSheetId] = useState<string>('');
  const [casesheetInfo, setCasesheetInfo] = useState<any>(null);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [callId, setcallId] = useState<string>('');

  const [loaded, setLoaded] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };
  const client = useApolloClient();
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { currentUserType } = useAuthContext();
  /* case sheet data*/
  const [symptoms, setSymptoms] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null
  >(null);
  const [documentArray, setDocumentArray] = useState();
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

  const [notes, setSRDNotes] = useState<string | null>(null);
  const [juniorDoctorNotes, setJuniorDoctorNotes] = useState<string | null>(null);
  const [consultType, setConsultType] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<boolean[]>([]);
  const [caseSheetEdit, setCaseSheetEdit] = useState<boolean>(false);
  const [followUpAfterInDays, setFollowUpAfterInDays] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState<string[]>([]);
  const [followUpConsultType, setFollowUpConsultType] = useState<string[]>([]);
  // const [isPdfPopoverOpen, setIsPdfPopoverOpen] = useState<boolean>(false);

  const [bp, setBp] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [drugAllergies, setDrugAllergies] = useState<string>('');
  const [dietAllergies, setDietAllergies] = useState<string>('');
  const [menstrualHistory, setMenstrualHistory] = useState<string>('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState<string>('');
  const [pastSurgicalHistory, setPastSurgicalHistory] = useState<string>('');
  const [lifeStyle, setLifeStyle] = useState<string>('');
  const [familyHistory, setFamilyHistory] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  // const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [appointmentStatus, setAppointmentStatus] = useState<string>('');
  const [sentToPatient, setSentToPatient] = useState<boolean>(false);
  const [isAppointmentEnded, setIsAppointmentEnded] = useState<boolean>(false);
  const [jrdName, setJrdName] = useState<string>('');
  const [jrdSubmitDate, setJrdSubmitDate] = useState<string>('');

  useEffect(() => {
    if (startAppointment) {
      followUp[0] = startAppointment;
      setFollowUp(followUp);
    }
  }, [startAppointment]);

  /* case sheet data*/

  /* need to be worked later */
  // let customNotes = '';
  // const setCasesheetNotes = (notes: string) => {
  //   customNotes = notes; // this will be used in saving case sheet.
  // };
  useEffect(() => {
    if (isSignedIn || currentUserType === LoggedInUserType.SECRETARY) {
      client
        .query<GetCaseSheet>({
          query: GET_CASESHEET,
          fetchPolicy: 'no-cache',
          variables: { appointmentId: appointmentId },
        })
        .then((_data) => {
          setCasesheetInfo(_data.data);
          setError('');
          _data!.data!.getCaseSheet!.caseSheetDetails &&
          _data!.data!.getCaseSheet!.caseSheetDetails.id
            ? setCaseSheetId(_data!.data!.getCaseSheet!.caseSheetDetails.id)
            : '';
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
            ? setSRDNotes((_data!.data!.getCaseSheet!.caseSheetDetails!.notes as unknown) as string)
            : setSRDNotes('');
          _data!.data!.getCaseSheet!.juniorDoctorNotes
            ? setJuniorDoctorNotes((_data!.data!.getCaseSheet!
                .juniorDoctorNotes as unknown) as string)
            : setJuniorDoctorNotes('');
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
          _data!.data!.getCaseSheet!.caseSheetDetails!.followUpConsultType
            ? setFollowUpConsultType(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.followUpConsultType,
              ] as unknown) as string[])
            : setFollowUpConsultType([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.appointment!.status
            ? setAppointmentStatus(_data!.data!.getCaseSheet!.caseSheetDetails!.appointment!.status)
            : setAppointmentStatus('');
          _data!.data!.getCaseSheet!.caseSheetDetails!.sentToPatient
            ? setSentToPatient(_data!.data!.getCaseSheet!.caseSheetDetails!.sentToPatient)
            : setSentToPatient(false);
          if (
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.caseSheetDetails &&
            _data.data.getCaseSheet.caseSheetDetails.appointment &&
            _data.data.getCaseSheet.caseSheetDetails.appointment.status &&
            _data.data.getCaseSheet.caseSheetDetails.appointment.status === 'COMPLETED'
          ) {
            setIsPdfPageOpen(true);
          }
          if (
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.caseSheetDetails &&
            _data.data.getCaseSheet.caseSheetDetails!.blobName &&
            _data.data.getCaseSheet.caseSheetDetails!.blobName !== undefined &&
            _data.data.getCaseSheet.caseSheetDetails!.blobName !== ''
          ) {
            const url = storageClient.getBlobUrl(_data.data.getCaseSheet.caseSheetDetails.blobName);
            setPrescriptionPdf(url);
          }
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
          // patient medical and family history
          if (
            _data &&
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.patientDetails &&
            _data.data.getCaseSheet.patientDetails.patientMedicalHistory
          ) {
            setBp(_data.data.getCaseSheet.patientDetails.patientMedicalHistory.bp || '');
            setDietAllergies(
              _data.data.getCaseSheet.patientDetails.patientMedicalHistory.dietAllergies || ''
            );
            setDrugAllergies(
              _data.data.getCaseSheet.patientDetails.patientMedicalHistory.drugAllergies || ''
            );
            setHeight(_data.data.getCaseSheet.patientDetails.patientMedicalHistory.height || '');
            setMenstrualHistory(
              _data.data.getCaseSheet.patientDetails.patientMedicalHistory.menstrualHistory || ''
            );
            setPastMedicalHistory(
              _data.data.getCaseSheet.patientDetails.patientMedicalHistory.pastMedicalHistory || ''
            );
            setPastSurgicalHistory(
              _data.data.getCaseSheet.patientDetails.patientMedicalHistory.pastSurgicalHistory || ''
            );
            setTemperature(
              _data.data.getCaseSheet.patientDetails.patientMedicalHistory.temperature || ''
            );
            setWeight(_data.data.getCaseSheet.patientDetails.patientMedicalHistory.weight || '');
          }

          const patientFamilyHistory =
            _data!.data!.getCaseSheet!.patientDetails &&
            _data!.data!.getCaseSheet!.patientDetails!.familyHistory
              ? _data!.data!.getCaseSheet!.patientDetails!.familyHistory[0]
              : null;

          const patientLifeStyle =
            _data!.data!.getCaseSheet!.patientDetails &&
            _data!.data!.getCaseSheet!.patientDetails!.lifeStyle
              ? _data!.data!.getCaseSheet!.patientDetails!.lifeStyle[0]
              : null;

          setFamilyHistory(
            patientFamilyHistory && patientFamilyHistory!.description
              ? patientFamilyHistory!.description
              : ''
          );

          setLifeStyle(
            patientLifeStyle && patientLifeStyle!.description ? patientLifeStyle!.description : ''
          );

          // set Jrd name and Jrd Casesheet submit date.
          let jrdSalutation = '',
            jrdFirstName = '',
            jrdLastName = '';
          if (
            _data &&
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDate
          ) {
            setJrdSubmitDate(_data.data.getCaseSheet.juniorDoctorCaseSheet.createdDate);
          }

          if (
            _data &&
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile.firstName
          ) {
            jrdFirstName =
              _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile.firstName;
          }

          if (
            _data &&
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile.lastName
          ) {
            jrdLastName =
              _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile.lastName;
          }

          // if (
          //   _data &&
          //   _data.data &&
          //   _data.data.getCaseSheet &&
          //   _data.data.getCaseSheet.juniorDoctorCaseSheet &&
          //   _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile &&
          //   _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile.salutation
          // ) {
          //   jrdSalutation =
          //     _data.data.getCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile.salutation;
          // }

          setJrdName(`${jrdFirstName} ${jrdLastName}`);
        })
        .catch((error: ApolloError) => {
          const networkErrorMessage = error.networkError ? error.networkError.message : null;
          const allMessages = error.graphQLErrors
            .map((e) => e.message)
            .concat(networkErrorMessage ? networkErrorMessage : []);
          const isCasesheetNotExists = allMessages.includes(AphErrorMessages.NO_CASESHEET_EXIST);
          if (isCasesheetNotExists) {
            console.log(error);
            setError('Creating Casesheet. Please wait....');
            mutationCreateSrdCaseSheet()
              .then((response) => {
                window.location.href = clientRoutes.ConsultTabs(
                  appointmentId,
                  patientId,
                  String(tabValue)
                );
              })
              .catch((e: ApolloError) => {
                setError('Unable to load Consult.');
              });
          }
        })
        .finally(() => {
          setLoaded(true);
        });
      return () => {
        const cookieStr = `action=`;
        document.cookie = cookieStr + ';path=/;';
      };
    }
  }, []);

  const sendCallNotificationFn = (callType: APPT_CALL_TYPE) => {
    client
      .query<SendCallNotification, SendCallNotificationVariables>({
        query: SEND_CALL_NOTIFICATION,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: appointmentId,
          callType: callType,
          doctorType: DOCTOR_CALL_TYPE.SENIOR,
        },
      })
      .then((_data) => {
        if (
          _data &&
          _data.data &&
          _data.data.sendCallNotification &&
          _data.data.sendCallNotification.status
        ) {
          setcallId(_data.data.sendCallNotification.callDetails.id);
        }
      })
      .catch((error: ApolloError) => {
        alert('An error occurred while sending notification to Client.');
      });
  };

  const sendToPatientAction = () => {
    client
      .mutate<UpdatePatientPrescriptionSentStatus, UpdatePatientPrescriptionSentStatusVariables>({
        mutation: UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS,
        variables: {
          caseSheetId: caseSheetId,
          sentToPatient: true,
        },
      })
      .then((_data) => {
        setAppointmentStatus('COMPLETED');
        setSentToPatient(true);
        setIsPdfPageOpen(true);
        setUrlToPatient(true);
      })
      .catch((e) => {
        setError('Error occured while sending prescription to patient');
        console.log('Error occured while sending prescription to patient', e);
        setSaving(false);
      });
  };

  const saveCasesheetAction = (flag: boolean, sendToPatientFlag: boolean) => {
    // followUp: followUp[0],
    // followUpDate: followUp[0] ? new Date(followUpDate[0]).toISOString() : '',
    // followUpAfterInDays:
    //   followUp[0] && followUpAfterInDays[0] !== 'Custom' ? followUpAfterInDays[0] : null,

    // console.log(followUp, followUpAfterInDays, 'follow up......');

    // console.log(
    //   pastMedicalHistory,
    //   pastSurgicalHistory,
    //   familyHistory,
    //   lifeStyle,
    //   menstrualHistory,
    //   drugAllergies,
    //   dietAllergies
    // );

    // console.log('notes...', customNotes);

    // this condition is written to avoid __typename from already existing data
    let symptomsFinal = null,
      diagnosisFinal = null,
      diagnosticPrescriptionFinal = null,
      medicinePrescriptionFinal = null,
      otherInstructionsFinal = null;
    if (symptoms && symptoms.length > 0) {
      symptomsFinal = symptoms.map((symptom) => {
        return _omit(symptom, '__typename');
      });
    }
    if (diagnosis && diagnosis.length > 0) {
      diagnosisFinal = diagnosis.map((diagnosis) => {
        return _omit(diagnosis, ['__typename', 'id']);
      });
    }
    if (diagnosticPrescription && diagnosticPrescription.length > 0) {
      diagnosticPrescriptionFinal = diagnosticPrescription.map((prescription) => {
        return _omit(prescription, ['__typename']);
      });
    }
    if (medicinePrescription && medicinePrescription.length > 0) {
      medicinePrescriptionFinal = medicinePrescription.map((prescription) => {
        return _omit(prescription, ['__typename']);
      });
    }
    if (otherInstructions && otherInstructions.length > 0) {
      otherInstructionsFinal = otherInstructions.map((instruction) => {
        return _omit(instruction, ['__typename']);
      });
    }
    setSaving(true);

    // this needs to be fixed.
    const followupISODate = new Date(followUpDate[0]).toISOString();
    const followupDateArray = followupISODate.split('T');

    // console.log(followupISODate, 'iso date......');

    client
      .mutate<ModifyCaseSheet, ModifyCaseSheetVariables>({
        mutation: MODIFY_CASESHEET,
        variables: {
          ModifyCaseSheetInput: {
            symptoms: symptomsFinal,
            notes: notes,
            diagnosis: diagnosisFinal,
            diagnosticPrescription: diagnosticPrescriptionFinal,
            followUp: followUp[0],
            followUpDate: followupDateArray[0],
            followUpAfterInDays:
              followUp[0] && followUpAfterInDays[0] !== 'Custom'
                ? parseInt(followUpAfterInDays[0], 10)
                : 0,
            followUpConsultType:
              followUpConsultType[0] === APPOINTMENT_TYPE.PHYSICAL
                ? APPOINTMENT_TYPE.PHYSICAL
                : APPOINTMENT_TYPE.ONLINE,
            otherInstructions: otherInstructionsFinal,
            medicinePrescription: medicinePrescriptionFinal,
            id: caseSheetId,
            lifeStyle: lifeStyle,
            familyHistory: familyHistory,
            dietAllergies: dietAllergies,
            drugAllergies: drugAllergies,
            height: height,
            menstrualHistory: menstrualHistory,
            pastMedicalHistory: pastMedicalHistory,
            pastSurgicalHistory: pastSurgicalHistory,
            temperature: temperature,
            weight: weight,
            bp: bp,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (_data && _data!.data!.modifyCaseSheet && _data!.data!.modifyCaseSheet!.blobName) {
          const url = storageClient.getBlobUrl(_data!.data!.modifyCaseSheet!.blobName);
          setPrescriptionPdf(url);
          setSaving(false);
        }
        if (!flag) {
          // setIsPopoverOpen(true);
          setIsConfirmDialogOpen(true);
        }
        if (sendToPatientFlag) {
          sendToPatientAction();
        }
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        alert(errorMessage);
        setSaving(false);
        console.log('Error occured while update casesheet', e);
      });
  };

  const endConsultAction = () => {
    saveCasesheetAction(false, false);
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
        //setIsPdfPopoverOpen(true);
        //setIsEnded(true);
        setAppointmentStatus('COMPLETED');
        setIsPdfPageOpen(true);
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while End casesheet', errorMessage, error);
        alert(errorMessage);
      });
  };

  const createSessionAction = () => {
    setSaving(true);
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
        //setCaseSheetId(_data.data.createAppointmentSession.caseSheetId);
        setError('');
        setSaving(false);
      })
      .catch((e: any) => {
        setError('Error occured creating session');
        console.log('Error occured creating session', e);
        setSaving(false);
      });

    // call this function to send notification.
    //sendCallNotificationFn();
  };

  const setStartConsultAction = (flag: boolean) => {
    setStartConsult('');
    const cookieStr = `action=${flag ? 'videocall' : 'audiocall'}`;
    document.cookie = cookieStr + ';path=/;';
    setTimeout(() => {
      setStartConsult(flag ? 'videocall' : 'audiocall');
      sendCallNotificationFn(flag ? APPT_CALL_TYPE.VIDEO : APPT_CALL_TYPE.AUDIO);
    }, 10);
  };

  const startAppointmentClick = (startAppointment: boolean) => {
    setStartAppointment(startAppointment);
  };

  return (
    <div className={classes.consultRoom}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      {!loaded && <CircularProgress className={classes.loading} />}

      {error && error !== '' && <Typography className={classes.tabRoot}>{error}</Typography>}
      {loaded && error === '' && (
        <CaseSheetContext.Provider
          value={{
            loading: !loaded,
            caseSheetId: appointmentId,
            documentArray,
            setDocumentArray,
            patientDetails: casesheetInfo!.getCaseSheet!.patientDetails,
            appointmentInfo: casesheetInfo!.getCaseSheet!.caseSheetDetails!.appointment,
            createdDoctorProfile: casesheetInfo!.getCaseSheet!.caseSheetDetails!
              .createdDoctorProfile,
            followUpConsultType,
            setFollowUpConsultType,
            symptoms,
            setSymptoms,
            notes,
            setSRDNotes,
            juniorDoctorNotes,
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
            appointmentDocuments: casesheetInfo!.getCaseSheet!.caseSheetDetails!.appointment!
              .appointmentDocuments,
            pastAppointments: casesheetInfo!.getCaseSheet!.pastAppointments,
            height,
            weight,
            bp,
            temperature,
            pastMedicalHistory,
            pastSurgicalHistory,
            dietAllergies,
            drugAllergies,
            lifeStyle,
            familyHistory,
            menstrualHistory,
            gender,
            setPastMedicalHistory,
            setPastSurgicalHistory,
            setDietAllergies,
            setDrugAllergies,
            setLifeStyle,
            setFamilyHistory,
            setMenstrualHistory,
            setHeight,
            setWeight,
            setBp,
            setTemperature,
            setGender,
            jrdName,
            jrdSubmitDate,
          }}
        >
          <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 65px)' }}>
            <div className={classes.container}>
              <CallPopover
                setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)}
                createSessionAction={createSessionAction}
                saveCasesheetAction={(flag: boolean, sendToPatientFlag: boolean) =>
                  saveCasesheetAction(flag, sendToPatientFlag)
                }
                endConsultAction={endConsultAction}
                appointmentId={appointmentId}
                appointmentDateTime={appointmentDateTime}
                doctorId={doctorId}
                urlToPatient={urlToPatient}
                caseSheetId={caseSheetId}
                prescriptionPdf={prescriptionPdf}
                sessionId={sessionId}
                token={token}
                startAppointment={startAppointment}
                startAppointmentClick={startAppointmentClick}
                saving={saving}
                appointmentStatus={appointmentStatus}
                sentToPatient={sentToPatient}
                isAppointmentEnded={isAppointmentEnded}
                //sendToPatientAction={(flag: boolean) => sendToPatientAction(flag)}
                setIsPdfPageOpen={(flag: boolean) => setIsPdfPageOpen(flag)}
                callId={callId}
              />
              <div>
                {!isPdfPageOpen ? (
                  <div>
                    <div>
                      <Tabs
                        value={tabValue}
                        variant="fullWidth"
                        classes={{
                          root: classes.tabsRoot,
                          indicator: classes.tabsIndicator,
                        }}
                        onChange={(e, newValue) => {
                          setTabValue(newValue);
                        }}
                      >
                        <Tab
                          classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                          label="Case Sheet"
                        />
                        <Tab
                          classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                          label="Chat"
                        />
                      </Tabs>
                    </div>
                    <TabContainer>
                      <div className={tabValue !== 0 ? classes.none : classes.block}>
                        {casesheetInfo ? <CaseSheet startAppointment={startAppointment} /> : ''}
                      </div>
                    </TabContainer>

                    <TabContainer>
                      <div className={tabValue !== 1 ? classes.none : classes.block}>
                        <div className={classes.chatContainer}>
                          <ConsultRoom
                            startConsult={startConsult}
                            sessionId={sessionId}
                            token={token}
                            appointmentId={paramId}
                            doctorId={doctorId}
                            patientId={patientId}
                          />
                        </div>
                      </div>
                    </TabContainer>
                  </div>
                ) : (
                  <div>
                    <CasesheetView />
                  </div>
                )}
              </div>
            </div>
          </Scrollbars>
        </CaseSheetContext.Provider>
      )}
      <Modal
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBox}>
          <div className={classes.tabHeader}>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setIsConfirmDialogOpen(false)}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            <h3>
              Are you sure you want to end your consult?
              {/* {casesheetInfo &&
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
                )} */}
            </h3>

            <Button
              className={classes.cancelConsult}
              //disabled={startAppointmentButton}
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              No
            </Button>
            <Button
              className={classes.consultButton}
              onClick={() => {
                endConsultActionFinal();
                setIsConfirmDialogOpen(false);
                //setIsPopoverOpen(true);
                //setAppointmentStatus('COMPLETED');
                //console.log('appointmentStatus ', appointmentStatus);
              }}
            >
              Yes
            </Button>
          </div>
          <div className={classes.contentTxt}>
            <span>
              After ending the consult you will get the option to preview/edit case sheet and send
              prescription to the patient
            </span>
          </div>
        </Paper>
      </Modal>

      {/* {isEnded && (
        <div className={classes.tabPdfBody}>
          <iframe src={prescriptionPdf} width="80%" height="450"></iframe>
        </div>
      )} */}

      {/* <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        className={classes.popupDialog}
      >
        <DialogTitle className={classes.headingTxt}>
          Are you sure you want to end your consult?
        </DialogTitle>
        <DialogActions>
          <Button color="primary" onClick={() => setIsConfirmDialogOpen(false)} autoFocus>
            No
          </Button>
          <Button
            color="primary"
            onClick={() => {
              endConsultActionFinal();
              setIsConfirmDialogOpen(false);
              //setIsPopoverOpen(true);
              //setAppointmentStatus('COMPLETED');
              //console.log('appointmentStatus ', appointmentStatus);
            }}
            autoFocus
          >
            Yes
          </Button>
          <DialogContent>
            <DialogContentText>
              After ending the consult you will get the option to preview/edit case sheet and send
              prescription to the patient
            </DialogContentText>
          </DialogContent>
        </DialogActions>
      </Dialog> */}
    </div>
  );
};
