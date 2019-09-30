import React, { useState, useEffect } from 'react';
import { Theme, Button, Avatar, CircularProgress } from '@material-ui/core';
import { useParams } from 'hooks/routerHooks';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { JDCallPopover } from 'components/JuniorDoctors/JDCallPopover';
import Typography from '@material-ui/core/Typography';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from 'graphql/types/CreateAppointmentSession';
import { UpdateCaseSheet, UpdateCaseSheetVariables } from 'graphql/types/UpdateCaseSheet';
import { CREATE_APPOINTMENT_SESSION, UPDATE_CASESHEET } from 'graphql/profiles';
import { GET_CASESHEET_JRD, CREATE_CASESHEET_FOR_JRD } from 'graphql/profiles';
import {
  CreateJuniorDoctorCaseSheet,
  CreateJuniorDoctorCaseSheetVariables,
} from 'graphql/types/CreateJuniorDoctorCaseSheet';
import {
  GetJuniorDoctorCaseSheet,
  GetJuniorDoctorCaseSheetVariables,
} from 'graphql/types/GetJuniorDoctorCaseSheet';
import {
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription,
} from 'graphql/types/GetJuniorDoctorCaseSheet';
import { REQUEST_ROLES, Gender } from 'graphql/types/globalTypes';
import { CaseSheet } from 'components/JuniorDoctors/JDCaseSheet/CaseSheet';
import { useAuth } from 'hooks/authHooks';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { ChatWindow } from 'components/JuniorDoctors/ChatWindow';
import Scrollbars from 'react-custom-scrollbars';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Relation } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import isNull from 'lodash/isNull';
import { format } from 'date-fns';
import { JDConsultRoomParams } from 'helpers/clientRoutes';
import { useMutation } from 'react-apollo-hooks';
import {
  RemoveFromConsultQueue,
  RemoveFromConsultQueueVariables,
} from 'graphql/types/RemoveFromConsultQueue';
import { REMOVE_FROM_CONSULT_QUEUE } from 'graphql/consults';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { clientRoutes } from 'helpers/clientRoutes';
/* patient related queries and mutations */
import {
  SAVE_PATIENT_FAMILY_HISTORY,
  SAVE_PATIENT_LIFE_STYLE,
  UPDATE_PATIENT_ALLERGIES,
} from 'graphql/consults';
import {
  SavePatientFamilyHistory,
  SavePatientFamilyHistoryVariables,
} from 'graphql/types/SavePatientFamilyHistory';
import {
  SavePatientLifeStyle,
  SavePatientLifeStyleVariables,
} from 'graphql/types/SavePatientLifeStyle';
import {
  UpdatePatientAllergies,
  UpdatePatientAllergiesVariables,
} from 'graphql/types/UpdatePatientAllergies';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { ApolloError } from 'apollo-client';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Redirect } from 'react-router';

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
      position: 'relative',
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
      backgroundColor: '#f7f8f5',
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
    backArrowSection: {
      position: 'fixed',
      width: '100%',
      top: 93,
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      position: 'absolute',
      left: 20,
      top: 20,
      [theme.breakpoints.up(1220)]: {
        left: -62,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
  };
});

export const JDConsultRoom: React.FC = () => {
  const classes = useStyles();
  const { patientId, appointmentId, queueId } = useParams<JDConsultRoomParams>();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = React.useState(false);
  const [newCaseSheet, setNewCaseSheet] = React.useState<boolean>(false);
  // let showConsultButtons = false;

  const { currentPatient: currentDoctor, isSignedIn } = useAuth();
  const doctorId = currentDoctor!.id;

  const mutationRemoveConsult = useMutation<
    RemoveFromConsultQueue,
    RemoveFromConsultQueueVariables
  >(REMOVE_FROM_CONSULT_QUEUE, {
    variables: {
      id: parseInt(queueId, 10),
    },
  });

  const mutationCreateJrdCaseSheet = useMutation<
    CreateJuniorDoctorCaseSheet,
    CreateJuniorDoctorCaseSheetVariables
  >(CREATE_CASESHEET_FOR_JRD, {
    variables: {
      appointmentId: appointmentId,
    },
  });

  // if (newCaseSheet) {
  //   return (
  //     <Redirect
  //       to={clientRoutes.JDConsultRoom({
  //         appointmentId: appointmentId,
  //         patientId: patientId,
  //         queueId: queueId,
  //       })}
  //     />
  //   );
  // }

  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [prescriptionPdf, setPrescriptionPdf] = useState<string>('');
  const [startConsult, setStartConsult] = useState<string>('');
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [appointmentDateTime, setappointmentDateTime] = useState<string>('');
  const [caseSheetId, setCaseSheetId] = useState<string>('');
  const [casesheetInfo, setCasesheetInfo] = useState<any>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);

  const [allergies, setPatientAllergies] = useState<string>('');
  const [lifeStyle, setPatientLifeStyle] = useState<string>('');
  const [familyHistory, setFamilyHistory] = useState<string>('');

  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const client = useApolloClient();

  /* case sheet data*/
  const [symptoms, setSymptoms] = useState<
    GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms[] | null
  >(null);
  const [diagnosis, setDiagnosis] = useState<
    GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis[] | null
  >(null);
  const [otherInstructions, setOtherInstructions] = useState<
    GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions[] | null
  >(null);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<
    | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription[]
    | null
  >(null);
  const [medicinePrescription, setMedicinePrescription] = useState<
    GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription[] | null
  >(null);
  const [userCardStrip, setUserCardStrip] = useState<string>('');

  const [notes, setNotes] = useState<string | null>(null);
  const [assignedDoctorId, setAssignedDoctorId] = useState<string | null>(null);

  const [consultType, setConsultType] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<boolean[]>([]);
  const [caseSheetEdit, setCaseSheetEdit] = useState<boolean>(false);
  const [followUpAfterInDays, setFollowUpAfterInDays] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState<string[]>([]);
  const [juniorDoctorNotes, setJuniorDoctorNotes] = useState<string | null>(null);
  /* case sheet data*/

  let assignedDoctorFirstName = '',
    assignedDoctorLastName = '',
    assignedDoctorMobile = '',
    assignedDoctorSpecialty = '',
    assignedDoctorPhoto = '',
    assignedDoctorSalutation = '';

  const {
    data: assignedDoctorDetailsData,
    loading: assignedDoctorDetailsLoading,
  } = useQueryWithSkip<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>(
    GET_DOCTOR_DETAILS_BY_ID,
    {
      variables: { id: assignedDoctorId || '' },
    }
  );

  if (!assignedDoctorDetailsLoading) {
    assignedDoctorFirstName =
      (assignedDoctorDetailsData &&
        assignedDoctorDetailsData.getDoctorDetailsById &&
        assignedDoctorDetailsData.getDoctorDetailsById.firstName) ||
      '';
    assignedDoctorLastName =
      (assignedDoctorDetailsData &&
        assignedDoctorDetailsData.getDoctorDetailsById &&
        assignedDoctorDetailsData.getDoctorDetailsById.lastName) ||
      '';
    assignedDoctorMobile =
      (assignedDoctorDetailsData &&
        assignedDoctorDetailsData.getDoctorDetailsById &&
        assignedDoctorDetailsData.getDoctorDetailsById.mobileNumber) ||
      '';
    assignedDoctorSpecialty =
      (assignedDoctorDetailsData &&
        assignedDoctorDetailsData.getDoctorDetailsById &&
        assignedDoctorDetailsData.getDoctorDetailsById.specialty &&
        assignedDoctorDetailsData.getDoctorDetailsById.specialty.name) ||
      '';
    assignedDoctorPhoto =
      (assignedDoctorDetailsData &&
        assignedDoctorDetailsData.getDoctorDetailsById &&
        assignedDoctorDetailsData.getDoctorDetailsById.photoUrl) ||
      '';
    assignedDoctorSalutation =
      (assignedDoctorDetailsData &&
        assignedDoctorDetailsData.getDoctorDetailsById &&
        assignedDoctorDetailsData.getDoctorDetailsById.salutation) ||
      '';
  }

  // console.log(assignedDoctorDetailsData, assignedDoctorDetailsLoading, assignedDoctorDetailsError);

  /* need to be worked later */
  let customNotes = '';
  const setCasesheetNotes = (notes: string) => {
    customNotes = notes; // this will be used in saving case sheet.
  };

  let appointmentDateIST = '';

  // retrieve patient details
  const patientFirstName =
    casesheetInfo &&
    casesheetInfo!.getJuniorDoctorCaseSheet &&
    casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails
      ? casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails.firstName
      : '';
  const patientLastName =
    casesheetInfo &&
    casesheetInfo!.getJuniorDoctorCaseSheet &&
    casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails
      ? casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails.lastName
      : '';
  const patientUhid =
    casesheetInfo &&
    casesheetInfo!.getJuniorDoctorCaseSheet &&
    casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails
      ? casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails.uhid
      : '';
  const patientRelation =
    casesheetInfo &&
    casesheetInfo.getJuniorDoctorCaseSheet &&
    casesheetInfo.getJuniorDoctorCaseSheet.patientDetails
      ? casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.relation
      : '';
  const patientAppointmentId =
    (casesheetInfo &&
      casesheetInfo.getJuniorDoctorCaseSheet &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.appointment &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.appointment.displayId) ||
    '';
  const patientAppointmentTimeUtc =
    (casesheetInfo &&
      casesheetInfo.getJuniorDoctorCaseSheet &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.appointment &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.appointment.appointmentDateTime) ||
    '';
  const patientPhotoUrl =
    casesheetInfo &&
    casesheetInfo.getJuniorDoctorCaseSheet &&
    casesheetInfo.getJuniorDoctorCaseSheet.patientDetails &&
    !isNull(casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.photoUrl)
      ? casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.photoUrl
      : require('images/PatientImage.png');

  if (patientAppointmentTimeUtc !== '') {
    appointmentDateIST = format(
      new Date(patientAppointmentTimeUtc).getTime(),
      'dd/MM/yyyy, hh:mm a'
    );

    // show/hide consult now buttons.
    // if (new Date(patientAppointmentTimeUtc).getTime() >= new Date().getTime())
    //   showConsultButtons = true;
  }
  // console.log('patient details....', casesheetInfo.getJuniorDoctorCaseSheet.patientDetails);
  const patientRelationHeader =
    patientRelation === Relation.ME ? ' Self' : _startCase(_toLower(patientRelation));

  // console.log(patientAllergies, '--------------');

  const savePatientAllergiesMutation = useMutation<
    UpdatePatientAllergies,
    UpdatePatientAllergiesVariables
  >(UPDATE_PATIENT_ALLERGIES, {
    variables: {
      patientId: patientId,
      allergies: allergies,
    },
  });

  const savePatientLifeStyleMutation = useMutation<
    SavePatientLifeStyle,
    SavePatientLifeStyleVariables
  >(SAVE_PATIENT_LIFE_STYLE, {
    variables: {
      patientLifeStyleInput: {
        patientId: patientId,
        description: lifeStyle,
      },
    },
  });

  const savePatientFamilyHistoryMutation = useMutation<
    SavePatientFamilyHistory,
    SavePatientFamilyHistoryVariables
  >(SAVE_PATIENT_FAMILY_HISTORY, {
    variables: {
      patientFamilyHistoryInput: {
        patientId: patientId,
        description: familyHistory,
        relation: Relation.ME,
      },
    },
  });

  useEffect(() => {
    if (isSignedIn) {
      client
        .query<GetJuniorDoctorCaseSheet, GetJuniorDoctorCaseSheetVariables>({
          query: GET_CASESHEET_JRD,
          fetchPolicy: 'no-cache',
          variables: { appointmentId: appointmentId },
        })
        .then((_data) => {
          setCasesheetInfo(_data.data);
          setError('');
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails &&
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails.id
            ? setCaseSheetId(_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails.id)
            : '';
          //setCaseSheetId(_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails.id);
          //TO DO. this must be altered later
          //in effiecient way of loading the data as api needs to be revamped based on the UI.
          _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.allergies
            ? setPatientAllergies(_data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.allergies)
            : '';
          const patientFamilyHistory =
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails &&
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.familyHistory
              ? _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.familyHistory[
                  _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.familyHistory.length - 1
                ]
              : null;
          const patientLifeStyle =
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails &&
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.lifeStyle
              ? _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.lifeStyle[
                  _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.lifeStyle.length - 1
                ]
              : null;
          setFamilyHistory(
            patientFamilyHistory && patientFamilyHistory!.description
              ? patientFamilyHistory!.description
              : ''
          );
          setPatientLifeStyle(
            patientLifeStyle && patientLifeStyle!.description ? patientLifeStyle!.description : ''
          );
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosis !== null
            ? setDiagnosis((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .diagnosis as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis[])
            : setDiagnosis([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.symptoms
            ? setSymptoms((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .symptoms as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms[])
            : setSymptoms([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.otherInstructions
            ? setOtherInstructions((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .otherInstructions as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions[])
            : setOtherInstructions([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosticPrescription
            ? setDiagnosticPrescription((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .diagnosticPrescription as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription[])
            : setDiagnosticPrescription([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.medicinePrescription
            ? setMedicinePrescription((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .medicinePrescription as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription[])
            : setMedicinePrescription([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.notes
            ? setNotes((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .notes as unknown) as string)
            : setNotes('');
          _data!.data!.getJuniorDoctorCaseSheet!.juniorDoctorNotes
            ? setJuniorDoctorNotes((_data!.data!.getJuniorDoctorCaseSheet!
                .juniorDoctorNotes as unknown) as string)
            : setJuniorDoctorNotes('');
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.consultType
            ? setConsultType(([
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.consultType,
              ] as unknown) as string[])
            : setConsultType([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUp
            ? setFollowUp(([
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUp,
              ] as unknown) as boolean[])
            : setFollowUp([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUpAfterInDays
            ? setFollowUpAfterInDays(([
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUpAfterInDays,
              ] as unknown) as string[])
            : setFollowUpAfterInDays([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUpDate
            ? setFollowUpDate(([
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUpDate,
              ] as unknown) as string[])
            : setFollowUpDate([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.doctorId
            ? setAssignedDoctorId(_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.doctorId)
            : setAssignedDoctorId(null);
          /* patient personal data state vars */
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUpDate
            ? setFollowUpDate(([
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.followUpDate,
              ] as unknown) as string[])
            : setFollowUpDate([]);
          if (
            _data.data &&
            _data.data.getJuniorDoctorCaseSheet &&
            _data.data.getJuniorDoctorCaseSheet.caseSheetDetails &&
            _data.data.getJuniorDoctorCaseSheet.caseSheetDetails.appointment &&
            _data.data.getJuniorDoctorCaseSheet.caseSheetDetails.appointment.appointmentDateTime
          ) {
            //setappointmentDateTime('2019-08-27T17:30:00.000Z');
            setappointmentDateTime(
              _data.data.getJuniorDoctorCaseSheet.caseSheetDetails.appointment.appointmentDateTime
            );
          }
          const cardStripArr = [];
          if (
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.dateOfBirth &&
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.dateOfBirth !== null &&
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.dateOfBirth !== ''
          ) {
            cardStripArr.push(
              Math.abs(
                new Date(Date.now()).getUTCFullYear() -
                  new Date(
                    _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.dateOfBirth
                  ).getUTCFullYear()
              ).toString()
            );
          }
          if (
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.gender &&
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.gender !== null
          ) {
            if (_data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.gender === Gender.FEMALE) {
              cardStripArr.push('F');
            }
            if (_data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.gender === Gender.MALE) {
              cardStripArr.push('M');
            }
            if (_data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.gender === Gender.OTHER) {
              cardStripArr.push('O');
            }
          }
          setUserCardStrip(cardStripArr.join(', '));
        })
        .catch((error: ApolloError) => {
          const networkErrorMessage = error.networkError ? error.networkError.message : null;
          const allMessages = error.graphQLErrors
            .map((e) => e.message)
            .concat(networkErrorMessage ? networkErrorMessage : []);
          const isCasesheetNotExists = allMessages.includes(AphErrorMessages.NO_CASESHEET_EXIST);
          if (isCasesheetNotExists) {
            setError('Creating Casesheet. Please wait....');
            mutationCreateJrdCaseSheet()
              .then((response) => {
                window.location.href = clientRoutes.JDConsultRoom({
                  appointmentId: appointmentId,
                  patientId: patientId,
                  queueId: queueId,
                });
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
        // console.log('in return...');
        const cookieStr = `action=`;
        document.cookie = cookieStr + ';path=/;';
      };
    }
  }, [appointmentId, client, isSignedIn]);

  const saveCasesheetAction = (flag: boolean) => {
    if (diagnosis!.length > 0) {
      setSaving(true);
      client
        .mutate<UpdateCaseSheet, UpdateCaseSheetVariables>({
          mutation: UPDATE_CASESHEET,
          variables: {
            UpdateCaseSheetInput: {
              symptoms: symptoms!.length > 0 ? JSON.stringify(symptoms) : null,
              notes: customNotes.length > 0 ? customNotes : null,
              diagnosis: diagnosis!.length > 0 ? JSON.stringify(diagnosis) : null,
              diagnosticPrescription:
                diagnosticPrescription!.length > 0 ? JSON.stringify(diagnosticPrescription) : null,
              followUp: false,
              followUpDate: '',
              followUpAfterInDays: '',
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
          savePatientAllergiesMutation();
          savePatientFamilyHistoryMutation();
          savePatientLifeStyleMutation();
          setSaving(false);
        })
        .catch((e) => {
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          alert(errorMessage);
          setSaving(false);
          console.log('Error occured while update casesheet', e);
        });
    } else {
      setIsDiagnosisDialogOpen(true);
    }
  };

  const endConsultAction = () => {
    if (diagnosis!.length > 0) {
      mutationRemoveConsult();
      savePatientAllergiesMutation();
      savePatientFamilyHistoryMutation();
      savePatientLifeStyleMutation();
      setIsDialogOpen(true);
      saveCasesheetAction(false);
    } else {
      setIsDiagnosisDialogOpen(true);
    }
  };

  const startAppointmentClick = (startAppointment: boolean) => {
    setStartAppointment(startAppointment);
  };

  const createSessionAction = () => {
    setSaving(true);
    client
      .mutate<CreateAppointmentSession, CreateAppointmentSessionVariables>({
        mutation: CREATE_APPOINTMENT_SESSION,
        variables: {
          createAppointmentSessionInput: {
            appointmentId,
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
        <CaseSheetContextJrd.Provider
          value={{
            loading: !loaded,
            caseSheetId: appointmentId,
            patientDetails: casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails,
            appointmentInfo: casesheetInfo!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment,
            symptoms,
            setSymptoms,
            notes,
            setNotes,
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
            healthVault: casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.healthVault,
            pastAppointments: casesheetInfo!.getJuniorDoctorCaseSheet!.pastAppointments,
            setCasesheetNotes,
          }}
        >
          <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 65px)' }}>
            <div className={classes.container}>
              <div className={classes.pageContainer}>
                {/* patient and doctors details start */}
                <div className={classes.pageHeader}>
                  <div className={classes.backArrowSection}>
                    <div className={classes.backArrow}>
                      <a href={clientRoutes.juniorDoctor()}>
                        <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                        <img
                          className={classes.whiteArrow}
                          src={require('images/ic_back_white.svg')}
                        />
                      </a>
                    </div>
                  </div>
                  <div className={classes.patientSection}>
                    <div className={classes.patientImage}>
                      <img
                        style={{ width: '100px' }}
                        src={patientPhotoUrl}
                        alt="Patient Profile Photo"
                      />
                    </div>
                    <div className={classes.patientInfo}>
                      <div className={classes.patientName}>
                        {patientFirstName} {patientLastName}
                        <span>({userCardStrip})</span>
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
                    {assignedDoctorDetailsLoading ? (
                      <CircularProgress />
                    ) : (
                      <>
                        <div className={classes.doctorImg}>
                          <Avatar
                            src={
                              assignedDoctorPhoto !== ''
                                ? assignedDoctorPhoto
                                : require('images/no_photo.png')
                            }
                            alt="Doctor Profile Photo"
                            className={classes.avatar}
                          />
                        </div>
                        <div className={classes.doctorInfo}>
                          <div className={classes.assign}>Assigned to:</div>
                          <div
                            className={classes.doctorName}
                          >{`${assignedDoctorSalutation} ${assignedDoctorFirstName} ${assignedDoctorLastName}`}</div>
                          <div className={classes.doctorType}>{assignedDoctorSpecialty}</div>
                          <div className={classes.doctorContact}>{assignedDoctorMobile}</div>
                        </div>
                      </>
                    )}
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
                  saving={saving}
                  startAppointment={startAppointment}
                  startAppointmentClick={startAppointmentClick}
                />
                <div className={classes.contentGroup}>
                  <div className={classes.leftSection}>
                    <div className={classes.blockGroup}>
                      <div className={classes.blockHeader}>Case Sheet</div>
                      <div className={`${classes.blockBody} ${classes.caseSheetBody}`}>
                        <Scrollbars autoHide={false} style={{ height: 'calc(100vh - 270px' }}>
                          <div className={classes.customScroll}>
                            {casesheetInfo ? (
                              <CaseSheet
                                lifeStyle={lifeStyle}
                                allergies={allergies}
                                familyHistory={familyHistory}
                                setLifeStyle={(lifeStyle: string) => setPatientLifeStyle(lifeStyle)}
                                setAllergies={(allergies: string) => setPatientAllergies(allergies)}
                                setFamilyHistory={(familyHistory: string) =>
                                  setFamilyHistory(familyHistory)
                                }
                              />
                            ) : null}
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
                          appointmentId={appointmentId}
                          doctorId={doctorId}
                          patientId={patientId}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Scrollbars>
        </CaseSheetContextJrd.Provider>
      )}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogContent>
          <DialogContentText>Casesheet has been successfully submitted.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setIsDialogOpen(false);
              window.location.href = clientRoutes.juniorDoctor();
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDiagnosisDialogOpen} onClose={() => setIsDiagnosisDialogOpen(false)}>
        <DialogTitle>&nbsp;</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter diagnosis</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => setIsDiagnosisDialogOpen(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
