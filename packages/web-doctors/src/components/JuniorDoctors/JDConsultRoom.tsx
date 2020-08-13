import React, { useState, useEffect, useRef } from 'react';
import { Theme, Button, Avatar, CircularProgress } from '@material-ui/core';
import { useParams } from 'hooks/routerHooks';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { JDCallPopover } from 'components/JuniorDoctors/JDCallPopover';
import Typography from '@material-ui/core/Typography';
import { useApolloClient } from 'react-apollo-hooks';
import Pubnub from 'pubnub';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from 'graphql/types/CreateAppointmentSession';
import { ModifyCaseSheet, ModifyCaseSheetVariables } from 'graphql/types/ModifyCaseSheet';
import {
  EndCallNotification,
  EndCallNotificationVariables,
} from 'graphql/types/EndCallNotification';
import {
  CREATE_APPOINTMENT_SESSION,
  GET_CASESHEET_JRD,
  CREATE_CASESHEET_FOR_JRD,
  MODIFY_CASESHEET,
} from 'graphql/profiles';
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
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription,
} from 'graphql/types/GetJuniorDoctorCaseSheet';
import {
  REQUEST_ROLES,
  Gender,
  CASESHEET_STATUS,
  DOCTOR_CALL_TYPE,
  APPT_CALL_TYPE,
  Relation,
  STATUS,
  DEVICETYPE,
  BOOKINGSOURCE,
} from 'graphql/types/globalTypes';
import { CaseSheet } from 'components/JuniorDoctors/JDCaseSheet/CaseSheet';
import { useAuth } from 'hooks/authHooks';
import { CaseSheetContextJrd, VitalErrorProps } from 'context/CaseSheetContextJrd';
import { ChatWindow } from 'components/JuniorDoctors/ChatWindow';
import Scrollbars from 'react-custom-scrollbars';
import LinearProgress from '@material-ui/core/LinearProgress';
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
import { REMOVE_FROM_CONSULT_QUEUE, END_CALL_NOTIFICATION } from 'graphql/consults';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { clientRoutes } from 'helpers/clientRoutes';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { GET_DOCTOR_DETAILS_BY_ID_DOCTOR } from 'graphql/doctors';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { ApolloError } from 'apollo-client';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import ReactCountdownClock from 'react-countdown-clock';
import IdleTimer from 'react-idle-timer';
import _omit from 'lodash/omit';
import { SEND_CALL_NOTIFICATION } from 'graphql/consults';
import {
  SendCallNotification,
  SendCallNotificationVariables,
} from 'graphql/types/SendCallNotification';
import moment from 'moment';
import Alert from '../Alert';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
} from 'components/case-sheet/panels/LocalStorageUtils';

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
    noDoctorImage: {
      padding: 20,
      paddingBottom: 0,
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
      '& img': {
        maxWidth: '100%',
      },
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
      position: 'relative',
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
      padding: '10px 5px 0 5px',
    },
    customScroll: {
      padding: '10px 15px',
      paddingBottom: 20,
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
    popoverTile: {
      color: '#fcb716',
      fontWeight: 500,
    },
    countdownLoader: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
  };
});

interface assignedDoctorType {
  assignedDoctorSalutation: string;
  assignedDoctorFirstName: string;
  assignedDoctorLastName: string;
  assignedDoctorDisplayName: string;
  assignedDoctorMobile: string;
  assignedDoctorSpecialty: string;
  assignedDoctorPhoto: string;
}

export const JDConsultRoom: React.FC = () => {
  const classes = useStyles({});
  const { patientId, appointmentId, queueId, isActive } = useParams<JDConsultRoomParams>();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [jrdNoFillDialog, setJrdNoFillDialog] = React.useState(false);
  const [isNewMessage, setIsNewMessage] = React.useState(false);
  const [notesJrd, setNotesJrd] = React.useState('');
  const [assignedDoctor, setAssignedDoctor] = useState<assignedDoctorType>({
    assignedDoctorSalutation: '',
    assignedDoctorFirstName: '',
    assignedDoctorLastName: '',
    assignedDoctorDisplayName: '',
    assignedDoctorMobile: '',
    assignedDoctorSpecialty: '',
    assignedDoctorPhoto: '',
  });

  const subscribekey: string = process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '';
  const publishkey: string = process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '';

  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribekey,
    publishKey: publishkey,
    ssl: true,
    restore: true,
    keepAlive: true,
    //presenceTimeout: 20,
    heartbeatInterval: 20,
    uuid: REQUEST_ROLES.JUNIOR,
  };
  const pubnub = new Pubnub(config);

  const { currentPatient: currentDoctor, isSignedIn, sessionClient } = useAuth();
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

  const [isEnded] = useState<boolean>(false);
  const [prescriptionPdf] = useState<string>('');
  const [startConsult, setStartConsult] = useState<string>('');
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [appointmentDateTime, setappointmentDateTime] = useState<string>('');
  const [caseSheetId, setCaseSheetId] = useState<string>('');
  const [casesheetInfo, setCasesheetInfo] = useState<any>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
  const [isAudioVideoCall, setIsAuditoVideoCall] = React.useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const client = useApolloClient();
  const [hasCameraMicPermission, setCameraMicPermission] = useState<boolean>(true);

  /* case sheet data*/
  const [dosageList, setDosageList] = useState<any>([]);
  const [symptoms, setSymptoms] = useState<
    GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms[] | null
  >(null);
  const [diagnosis, setDiagnosis] = useState<
    GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis[] | null
  >(null);
  const [otherInstructions, setOtherInstructions] = useState<
    GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions[] | null
  >(null);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<any[] | null>(null);
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
  const [autoCloseCaseSheet, setAutoCloseCaseSheet] = useState<boolean>(false);

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
  const [callId, setcallId] = useState<string>('');
  const [chatRecordId, setChatRecordId] = useState<string>('');
  const [documentArray, setDocumentArray] = useState<any>();
  const [medicationHistory, setMedicationHistory] = useState<string>('');
  const [occupationHistory, setOccupationHistory] = useState<string>('');
  const [referralSpecialtyName, setReferralSpecialtyName] = useState<string>('');
  const [referralDescription, setReferralDescription] = useState<string>('');
  const [referralError, setReferralError] = useState<boolean>(false);
  const [vitalError, setVitalError] = useState<VitalErrorProps>({ height: '', weight: '' });

  //OT Error state
  const [sessionError, setSessionError] = React.useState<boolean>(null);
  const [publisherError, setPublisherError] = React.useState<boolean>(null);
  const [subscriberError, setSubscriberError] = React.useState<boolean>(null);

  /* case sheet data*/
  let customNotes = '',
    appointmentDateIST = '';

  // const {
  //   data: assignedDoctorDetailsData,
  //   loading: assignedDoctorDetailsLoading,
  // } = useQueryWithSkip<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>(
  //   GET_DOCTOR_DETAILS_BY_ID_DOCTOR,
  //   {
  //     variables: { id: assignedDoctorId || '' },
  //   }
  // );

  // if (!assignedDoctorDetailsLoading) {
  //   assignedDoctorFirstName =
  //     (assignedDoctorDetailsData &&
  //       assignedDoctorDetailsData.getDoctorDetailsById &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.firstName) ||
  //     '';
  //   assignedDoctorLastName =
  //     (assignedDoctorDetailsData &&
  //       assignedDoctorDetailsData.getDoctorDetailsById &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.lastName) ||
  //     '';
  //   assignedDoctorDisplayName =
  //     (assignedDoctorDetailsData &&
  //       assignedDoctorDetailsData.getDoctorDetailsById &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.displayName) ||
  //     '';
  //   assignedDoctorMobile =
  //     (assignedDoctorDetailsData &&
  //       assignedDoctorDetailsData.getDoctorDetailsById &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.mobileNumber) ||
  //     '';
  //   assignedDoctorSpecialty =
  //     (assignedDoctorDetailsData &&
  //       assignedDoctorDetailsData.getDoctorDetailsById &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.specialty &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.specialty.name) ||
  //     '';
  //   assignedDoctorPhoto =
  //     (assignedDoctorDetailsData &&
  //       assignedDoctorDetailsData.getDoctorDetailsById &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.photoUrl) ||
  //     '';
  //   assignedDoctorSalutation =
  //     (assignedDoctorDetailsData &&
  //       assignedDoctorDetailsData.getDoctorDetailsById &&
  //       assignedDoctorDetailsData.getDoctorDetailsById.salutation) ||
  //     '';
  // }

  const setCasesheetNotes = (notes: string) => {
    customNotes = notes; // this will be used in saving case sheet.
    setNotesJrd(customNotes);
  };

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
  const patientMobileNumber =
    casesheetInfo &&
    casesheetInfo.getJuniorDoctorCaseSheet &&
    casesheetInfo.getJuniorDoctorCaseSheet.patientDetails
      ? casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.mobileNumber
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
      : '';

  if (patientAppointmentTimeUtc !== '') {
    appointmentDateIST = format(
      new Date(patientAppointmentTimeUtc).getTime(),
      'dd/MM/yyyy, hh:mm a'
    );
  }

  const scrollbars = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (caseSheetEdit && scrollbars) {
      const elem = scrollbars.current as HTMLDivElement;
      elem.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }, [caseSheetEdit, scrollbars]);

  useEffect(() => {
    const storageItem = getLocalStorageItem(appointmentId);
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
          _data!.data!.getJuniorDoctorCaseSheet!.allowedDosages
            ? setDosageList(_data!.data!.getJuniorDoctorCaseSheet!.allowedDosages)
            : setDosageList([]);

          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails &&
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails.id
            ? setCaseSheetId(_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails.id)
            : '';

          const patientFamilyHistory =
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails &&
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.familyHistory
              ? _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.familyHistory[0]
              : null;

          const patientLifeStyle =
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails &&
            _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.lifeStyle
              ? _data!.data!.getJuniorDoctorCaseSheet!.patientDetails!.lifeStyle[0]
              : null;

          setFamilyHistory(
            storageItem && storageItem.familyHistory
              ? storageItem.familyHistory
              : patientFamilyHistory && patientFamilyHistory!.description
              ? patientFamilyHistory!.description
              : ''
          );

          setLifeStyle(
            storageItem && storageItem.lifeStyle
              ? storageItem.lifeStyle
              : patientLifeStyle && patientLifeStyle!.description
              ? patientLifeStyle!.description
              : ''
          );

          setOccupationHistory(
            storageItem && storageItem.occupationHistory
              ? storageItem.occupationHistory
              : patientLifeStyle && patientLifeStyle!.occupationHistory
              ? patientLifeStyle!.occupationHistory
              : ''
          );

          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosis !== null
            ? setDiagnosis((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .diagnosis as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis[])
            : setDiagnosis(
                storageItem && storageItem.diagnosis && storageItem.diagnosis.length > 0
                  ? storageItem.diagnosis
                  : []
              );

          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.symptoms
            ? setSymptoms((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .symptoms as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms[])
            : setSymptoms(
                storageItem && storageItem.symptoms && storageItem.symptoms.length > 0
                  ? storageItem.symptoms
                  : []
              );

          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.otherInstructions
            ? setOtherInstructions((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .otherInstructions as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions[])
            : setOtherInstructions(
                storageItem &&
                  storageItem.otherInstructions &&
                  storageItem.otherInstructions.length > 0
                  ? storageItem.otherInstructions
                  : []
              );

          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosticPrescription
            ? setDiagnosticPrescription((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .diagnosticPrescription as unknown) as any[])
            : setDiagnosticPrescription(
                storageItem &&
                  storageItem.diagnosticPrescription &&
                  storageItem.diagnosticPrescription.length > 0
                  ? storageItem.diagnosticPrescription
                  : []
              );

          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.medicinePrescription
            ? setMedicinePrescription((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .medicinePrescription as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription[])
            : setMedicinePrescription(
                storageItem &&
                  storageItem.medicinePrescription &&
                  storageItem.medicinePrescription.length > 0
                  ? storageItem.medicinePrescription
                  : []
              );

          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.notes
            ? setNotes((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .notes as unknown) as string)
            : setNotes(storageItem && storageItem.notes ? storageItem.notes : '');

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
          // set seniorDoctorDetails start
          const assignDoctorData = {
            assignedDoctorSalutation: '',
            assignedDoctorFirstName: '',
            assignedDoctorLastName: '',
            assignedDoctorDisplayName: '',
            assignedDoctorMobile: '',
            assignedDoctorSpecialty: '',
            assignedDoctorPhoto: '',
          };
          if (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo) {
            assignDoctorData.assignedDoctorFirstName =
              (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo &&
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                  .firstName) ||
              '';
            assignDoctorData.assignedDoctorLastName =
              (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo &&
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                  .lastName) ||
              '';
            assignDoctorData.assignedDoctorDisplayName =
              (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo &&
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                  .displayName) ||
              '';
            assignDoctorData.assignedDoctorMobile =
              (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo &&
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                  .mobileNumber) ||
              '';
            assignDoctorData.assignedDoctorSpecialty =
              (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                .specialty &&
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                  .specialty!.name) ||
              '';
            assignDoctorData.assignedDoctorPhoto =
              (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo &&
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                  .photoUrl) ||
              '';
            assignDoctorData.assignedDoctorSalutation =
              (_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo &&
                _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.doctorInfo!
                  .salutation) ||
              '';
            setAssignedDoctor(assignDoctorData);
          } else {
            console.log(
              'Senior doctor detail not available,',
              _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment
            );
          }
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

          // set gender
          if (
            _data &&
            _data.data &&
            _data.data.getJuniorDoctorCaseSheet &&
            _data.data.getJuniorDoctorCaseSheet.patientDetails &&
            _data.data.getJuniorDoctorCaseSheet.patientDetails &&
            _data.data.getJuniorDoctorCaseSheet.patientDetails.gender
          ) {
            setGender(_data.data.getJuniorDoctorCaseSheet.patientDetails.gender);
          }

          // Refferal
          if (
            _data &&
            _data.data &&
            _data.data.getJuniorDoctorCaseSheet &&
            _data.data.getJuniorDoctorCaseSheet.caseSheetDetails &&
            _data.data.getJuniorDoctorCaseSheet.caseSheetDetails.referralSpecialtyName
          )
            setReferralSpecialtyName(
              storageItem && storageItem.referralSpecialtyName
                ? storageItem.referralSpecialtyName
                : _data.data.getJuniorDoctorCaseSheet.caseSheetDetails.referralSpecialtyName
            );

          if (
            _data &&
            _data.data &&
            _data.data.getJuniorDoctorCaseSheet &&
            _data.data.getJuniorDoctorCaseSheet.caseSheetDetails &&
            _data.data.getJuniorDoctorCaseSheet.caseSheetDetails.referralDescription
          )
            setReferralDescription(
              storageItem && storageItem.referralDescription
                ? storageItem.referralDescription
                : _data.data.getJuniorDoctorCaseSheet.caseSheetDetails.referralDescription
            );

          // patient medical and family history
          if (
            _data &&
            _data.data &&
            _data.data.getJuniorDoctorCaseSheet &&
            _data.data.getJuniorDoctorCaseSheet.patientDetails &&
            _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
          ) {
            setBp(
              storageItem && storageItem.bp
                ? storageItem.bp
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory.bp
            );
            setDietAllergies(
              storageItem && storageItem.dietAllergies
                ? storageItem.dietAllergies
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                    .dietAllergies
            );
            setDrugAllergies(
              storageItem && storageItem.drugAllergies
                ? storageItem.drugAllergies
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                    .drugAllergies
            );

            setHeight(
              storageItem && storageItem.height
                ? storageItem.height
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory.height
            );

            setMenstrualHistory(
              storageItem && storageItem.menstrualHistory
                ? storageItem.menstrualHistory
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                    .menstrualHistory
            );

            setPastMedicalHistory(
              storageItem && storageItem.pastMedicalHistory
                ? storageItem.pastMedicalHistory
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                    .pastMedicalHistory
            );

            setMedicationHistory(
              storageItem && storageItem.medicationHistory
                ? storageItem.medicationHistory
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                    .medicationHistory
            );

            setPastSurgicalHistory(
              storageItem && storageItem.pastSurgicalHistory
                ? storageItem.pastSurgicalHistory
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                    .pastSurgicalHistory
            );

            setTemperature(
              storageItem && storageItem.temperature
                ? storageItem.temperature
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                    .temperature
            );

            setWeight(
              storageItem && storageItem.weight
                ? storageItem.weight
                : _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory.weight
            );
          }
          // -------------------------------------------------------------- //
          navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then(function(stream) {
              setCameraMicPermission(true);
            })
            .catch(function(err) {
              setCameraMicPermission(false);
            });
          // -------------------------------------------------------------- //
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
                  isActive: 'active',
                });
              })
              .catch((e: ApolloError) => {
                const logObject = {
                  api: 'CreateJuniorDoctorCaseSheet',
                  appointmentId: appointmentId,
                  doctorId: currentDoctor!.id,
                  doctorDisplayName: currentDoctor!.displayName,
                  patientId: patientId,
                  patientName: getPatientName(),
                  currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                  appointmentDateTime: appointmentDateTime
                    ? moment(new Date(appointmentDateTime)).format('MMMM DD YYYY h:mm:ss a')
                    : '',
                  error: JSON.stringify(e),
                };

                sessionClient.notify(JSON.stringify(logObject));
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
  }, [appointmentId, client, isSignedIn]);

  // if this function triggered it implies that Jrd has not performed any action on popup.
  const triggerAutoEndConsult = () => {
    setJrdNoFillDialog(false);
    // trigger auto close sheet action and pass it to conext for sending out chat message.
    setAutoCloseCaseSheet(true);
    // end consult automatically.
    endConsultAutoAction();
  };

  const sendCallNotificationFn = (callType: APPT_CALL_TYPE, isCall: boolean) => {
    pubnub
      .hereNow({
        channels: [appointmentId],
        includeUUIDs: true,
      })
      .then((response: any) => {
        const occupants = response.channels[appointmentId].occupants;
        const occupancyDoctor = occupants.filter((obj: any) => {
          return obj.uuid.indexOf('JUNIOR') > -1;
        });
        sendCallNotificationFnWithCheck(callType, isCall, occupancyDoctor.length);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const sendCallNotificationFnWithCheck = (
    callType: APPT_CALL_TYPE,
    isCall: boolean,
    numberOfParticipants: number
  ) => {
    client
      .query<SendCallNotification, SendCallNotificationVariables>({
        query: SEND_CALL_NOTIFICATION,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: appointmentId,
          callType: callType,
          doctorType: DOCTOR_CALL_TYPE.JUNIOR,
          deviceType: DEVICETYPE.DESKTOP,
          callSource: BOOKINGSOURCE.WEB,
          numberOfParticipants,
        },
      })
      .then((_data) => {
        if (
          _data &&
          _data.data &&
          _data.data.sendCallNotification &&
          _data.data.sendCallNotification.status
        ) {
          isCall
            ? setcallId(_data.data.sendCallNotification.callDetails.id)
            : setChatRecordId(_data.data.sendCallNotification.callDetails.id);
        }
      })
      .catch((error: ApolloError) => {
        const logObject = {
          api: 'SendCallNotification',
          inputParam: JSON.stringify({
            appointmentId: appointmentId,
            callType: callType,
            doctorType: DOCTOR_CALL_TYPE.JUNIOR,
            deviceType: DEVICETYPE.DESKTOP,
            callSource: BOOKINGSOURCE.WEB,
          }),
          appointmentId: appointmentId,
          doctorId: currentDoctor!.id,
          doctorDisplayName: currentDoctor!.displayName,
          patientId: patientId,
          patientName: getPatientName(),
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: appointmentDateTime
            ? moment(new Date(appointmentDateTime)).format('MMMM DD YYYY h:mm:ss a')
            : '',
          error: JSON.stringify(error),
        };

        sessionClient.notify(JSON.stringify(logObject));
        console.log('An error occurred while sending notification to Client.');
      });
  };

  const saveCasesheetAction = (flag: boolean, endConsult: boolean) => {
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
        return {
          itemname: prescription.itemName ? prescription.itemName : prescription.itemname,
        };
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
    const inputVariables = {
      symptoms: symptomsFinal,
      notes: notesJrd.length > 0 ? notesJrd : '',
      diagnosis: diagnosisFinal,
      diagnosticPrescription: diagnosticPrescriptionFinal,
      followUp: false,
      followUpAfterInDays: 0,
      otherInstructions: otherInstructionsFinal,
      medicinePrescription: medicinePrescriptionFinal,
      id: caseSheetId,
      //status: endConsult ? CASESHEET_STATUS.COMPLETED : CASESHEET_STATUS.PENDING,
      lifeStyle: lifeStyle || '',
      familyHistory: familyHistory || '',
      dietAllergies: dietAllergies || '',
      drugAllergies: drugAllergies || '',
      height: height || '',
      menstrualHistory: menstrualHistory || '',
      pastMedicalHistory: pastMedicalHistory || '',
      pastSurgicalHistory: pastSurgicalHistory || '',
      temperature: temperature || '',
      weight: weight || '',
      bp: bp || '',
      medicationHistory: medicationHistory || '',
      occupationHistory: occupationHistory || '',
      referralSpecialtyName: referralSpecialtyName || '',
      referralDescription: referralDescription || '',
    };

    setSaving(true);
    client
      .mutate<ModifyCaseSheet, ModifyCaseSheetVariables>({
        mutation: MODIFY_CASESHEET,
        variables: {
          ModifyCaseSheetInput: inputVariables,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const logObject = {
          api: 'ModifyCaseSheetend',
          inputParam: JSON.stringify(inputVariables),
          appointmentId: appointmentId,
        };
        sessionClient.notify(JSON.stringify(logObject));
        setSaving(false);
        if (!flag) {
          endCallNotificationAction(false);
          setIsDialogOpen(true);
        }
      })
      .catch((e) => {
        const logObject = {
          api: 'ModifyCaseSheet',
          inputParam: JSON.stringify(inputVariables),
          appointmentId: appointmentId,
          doctorId: currentDoctor!.id,
          doctorDisplayName: currentDoctor!.displayName,
          patientId: patientId,
          patientName: getPatientName(),
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(e),
        };
        sessionClient.notify(JSON.stringify(logObject));

        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        alert(errorMessage);
        setSaving(false);
      });
  };

  const endConsultAction = () => {
    // open confirmation popup after removing from queue
    saveCasesheetAction(false, true);
    mutationRemoveConsult()
      .then(() => {
        const logObject = {
          api: 'RemoveFromConsultQueue',
          appointmentId: appointmentId,
          inputParam: JSON.stringify({
            id: parseInt(queueId, 10),
          }),
        };
        sessionClient.notify(JSON.stringify(logObject));
        removeLocalStorageItem(appointmentId);
      })
      .catch((e: ApolloError) => {
        //setSaving(false);
        alert('Something went wrong, plz try again later.');
        const logObject = {
          api: 'RemoveFromConsultQueue',
          inputParam: JSON.stringify({
            id: parseInt(queueId, 10),
          }),
          appointmentId: appointmentId,
          doctorId: currentDoctor!.id,
          doctorDisplayName: currentDoctor!.displayName,
          patientId: patientId,
          patientName: getPatientName(),
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: appointmentDateTime
            ? moment(new Date(appointmentDateTime)).format('MMMM DD YYYY h:mm:ss a')
            : '',
          error: JSON.stringify(e),
        };
        sessionClient.notify(JSON.stringify(logObject));
      });
  };

  // this will trigger end consult automatically after one minute
  const endConsultAutoAction = () => {
    endCallNotificationAction(false);
    saveCasesheetAction(true, true);
    mutationRemoveConsult()
      .then(() => {
        removeLocalStorageItem(appointmentId);
        if (document.getElementById('activeConsult')) {
          document.getElementById('activeConsult')!.click();
        }
      })
      .catch((e: ApolloError) => {
        const logObject = {
          api: 'RemoveFromConsultQueue',
          inputParam: JSON.stringify({
            id: parseInt(queueId, 10),
          }),
          appointmentId: appointmentId,
          doctorId: currentDoctor!.id,
          doctorDisplayName: currentDoctor!.displayName,
          patientId: patientId,
          patientName: getPatientName(),
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: appointmentDateTime
            ? moment(new Date(appointmentDateTime)).format('MMMM DD YYYY h:mm:ss a')
            : '',
          error: JSON.stringify(e),
        };

        sessionClient.notify(JSON.stringify(logObject));
      });
  };
  const getPatientName = () => {
    const patientName =
      casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
      ' ' +
      casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
    return patientName ? patientName : '';
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
            requestRole: REQUEST_ROLES.JUNIOR,
          },
        },
      })
      .then((_data: any) => {
        let sessId = _data.data.createAppointmentSession.sessionId;
        let tok = _data.data.createAppointmentSession.appointmentToken;
        if (sessId !== '' && tok !== '') {
          setsessionId(sessId);
          settoken(tok);
          sendCallNotificationFn(APPT_CALL_TYPE.CHAT, false);
          setError('');
          setSaving(false);
        } else {
          if (document.getElementById('activeConsult')) {
            alert('Appointment already fast-tracked by Senior Doctor');
            document.getElementById('activeConsult')!.click();
          }
        }
      })
      .catch((e: any) => {
        const logObject = {
          api: 'CreateAppointmentSession',
          inputParam: JSON.stringify({
            appointmentId: appointmentId,
            requestRole: REQUEST_ROLES.JUNIOR,
          }),
          appointmentId: appointmentId,
          doctorId: currentDoctor!.id,
          doctorDisplayName: currentDoctor!.displayName,
          patientId: patientId,
          patientName: getPatientName(),
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(error),
        };

        sessionClient.notify(JSON.stringify(logObject));
        setError('Error occured creating session');
      });
  };

  const setStartConsultAction = (flag: boolean) => {
    setStartConsult('');
    const cookieStr = `action=${flag ? 'videocall' : 'audiocall'}`;
    document.cookie = cookieStr + ';path=/;';
    setTimeout(() => {
      setStartConsult(flag ? 'videocall' : 'audiocall');
      sendCallNotificationFn(flag ? APPT_CALL_TYPE.VIDEO : APPT_CALL_TYPE.AUDIO, true);
    }, 10);
  };

  const disableChat = () => {
    let status;
    let casesheetStatus;
    if (
      casesheetInfo &&
      casesheetInfo.getJuniorDoctorCaseSheet &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.appointment
    ) {
      status = casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.appointment.status;
    }
    if (
      casesheetInfo &&
      casesheetInfo.getJuniorDoctorCaseSheet &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails &&
      casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.status
    ) {
      casesheetStatus = casesheetInfo.getJuniorDoctorCaseSheet.caseSheetDetails.status;
    }
    return isActive === 'done' ||
      (casesheetStatus && casesheetStatus === STATUS.COMPLETED) ||
      (status && status === STATUS.CANCELLED) ||
      (status && status === STATUS.COMPLETED)
      ? true
      : false;
  };
  const endCallNotificationAction = (isCall: boolean) => {
    client
      .query<EndCallNotification, EndCallNotificationVariables>({
        query: END_CALL_NOTIFICATION,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentCallId: isCall ? callId : chatRecordId,
        },
      })
      .catch((error: ApolloError) => {
        const logObject = {
          api: 'EndCallNotification',
          inputParam: JSON.stringify({
            appointmentCallId: isCall ? callId : chatRecordId,
          }),
          appointmentId: appointmentId,
          doctorId: currentDoctor!.id,
          doctorDisplayName: currentDoctor!.displayName,
          patientId: patientId,
          patientName: getPatientName(),
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(error),
        };
        sessionClient.notify(JSON.stringify(logObject));
        console.log('Error in Call Notification', error.message);
      });
  };
  const idleTimerRef = useRef(null);
  const idleTimeValueInMinutes = 1;
  // const assignedDoctor = {
  //   assignedDoctorSalutation: assignedDoctorSalutation,
  //   assignedDoctorFirstName: assignedDoctorFirstName,
  //   assignedDoctorLastName: assignedDoctorLastName,
  //   assignedDoctorDisplayName: assignedDoctorDisplayName,
  // };
  return !loaded ? (
    <LinearProgress />
  ) : (
    <div className={classes.root}>
      {casesheetInfo!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!.appointmentState !==
        'AWAITING_RESCHEDULE' &&
        !disableChat() &&
        !isAudioVideoCall && (
          <IdleTimer
            ref={idleTimerRef}
            element={document}
            onIdle={(e) => {
              setJrdNoFillDialog(true);
            }}
            debounce={250}
            timeout={1000 * 60 * idleTimeValueInMinutes}
          />
        )}
      <div className={classes.headerSticky}>
        <Header />
      </div>
      {error && error !== '' && <Typography className={classes.tabRoot}>{error}</Typography>}
      {loaded && error === '' && (
        <CaseSheetContextJrd.Provider
          value={{
            loading: !loaded,
            dosageList: dosageList,
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
            documentArray,
            setDocumentArray,
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
            appointmentDocuments: casesheetInfo!.getJuniorDoctorCaseSheet!.caseSheetDetails!
              .appointment!.appointmentDocuments,
            pastAppointments: casesheetInfo!.getJuniorDoctorCaseSheet!.pastAppointments,
            setCasesheetNotes,
            autoCloseCaseSheet,
            height,
            weight,
            vitalError,
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
            setVitalError,
            setWeight,
            setBp,
            setTemperature,
            setGender,
            medicationHistory,
            setMedicationHistory,
            occupationHistory,
            setOccupationHistory,
            referralSpecialtyName,
            referralDescription,
            referralError,
            setReferralError,
            setReferralSpecialtyName,
            setReferralDescription,
          }}
        >
          <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 65px)' }}>
            <div className={classes.container}>
              <div className={classes.pageContainer}>
                {/* patient and doctors details start */}
                <div className={classes.pageHeader}>
                  <div className={classes.backArrowSection}>
                    <div className={classes.backArrow}>
                      <a href={clientRoutes.juniorDoctorActive()}>
                        <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                        <img
                          className={classes.whiteArrow}
                          src={require('images/ic_back_white.svg')}
                        />
                      </a>
                    </div>
                  </div>
                  <div className={classes.patientSection}>
                    <div
                      className={`${classes.patientImage}  ${
                        patientPhotoUrl === '' ? classes.noDoctorImage : ''
                      }`}
                    >
                      <img
                        style={{ width: '100px' }}
                        src={
                          patientPhotoUrl !== '' ? patientPhotoUrl : require('images/no_photo.png')
                        }
                        alt="Patient Profile Photo"
                      />
                    </div>
                    <div className={classes.patientInfo}>
                      <div className={classes.patientName}>
                        {patientFirstName} {patientLastName}
                        <span>({userCardStrip})</span>
                      </div>
                      <div className={classes.patientTextInfo}>
                        <label>UHID:</label> {patientUhid} | <label>Phone No.:</label>
                        {patientMobileNumber}
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
                    {casesheetInfo ? (
                      <>
                        <div className={classes.doctorImg}>
                          <Avatar
                            src={
                              assignedDoctor.assignedDoctorPhoto !== ''
                                ? assignedDoctor.assignedDoctorPhoto
                                : require('images/no_photo.png')
                            }
                            alt="Doctor Profile Photo"
                            className={classes.avatar}
                          />
                        </div>
                        <div className={classes.doctorInfo}>
                          <div className={classes.assign}>Assigned to:</div>
                          <div className={classes.doctorName}>{`${
                            assignedDoctor.assignedDoctorSalutation
                          }${'.'} ${assignedDoctor.assignedDoctorFirstName} ${
                            assignedDoctor.assignedDoctorLastName
                          }`}</div>
                          <div className={classes.doctorType}>
                            {assignedDoctor.assignedDoctorSpecialty}
                          </div>
                          <div className={classes.doctorContact}>
                            {assignedDoctor.assignedDoctorMobile.slice(0, 3)}{' '}
                            {assignedDoctor.assignedDoctorMobile.split('+91').join(' ')}
                          </div>
                        </div>
                      </>
                    ) : (
                      <CircularProgress />
                    )}
                  </div>
                </div>
                {/* patient and doctors details end */}

                {!disableChat() && (
                  <JDCallPopover
                    setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)}
                    createSessionAction={createSessionAction}
                    saveCasesheetAction={(flag: boolean, endConsult: boolean) =>
                      saveCasesheetAction(flag, endConsult)
                    }
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
                    assignedDoctor={assignedDoctor}
                    isAudioVideoCallEnded={(isAudioVideoCall: boolean) => {
                      setIsAuditoVideoCall(isAudioVideoCall);
                    }}
                    endCallNotificationAction={(callId: boolean) =>
                      endCallNotificationAction(callId)
                    }
                    hasCameraMicPermission={hasCameraMicPermission}
                    setSessionError={setSessionError}
                    setPublisherError={setPublisherError}
                    setSubscriberError={setSubscriberError}
                  />
                )}
                <div className={classes.contentGroup}>
                  <div className={classes.leftSection}>
                    <div className={classes.blockGroup}>
                      <div className={classes.blockHeader}>Case Sheet</div>
                      <div className={`${classes.blockBody} ${classes.caseSheetBody}`}>
                        <Scrollbars autoHide={false} style={{ height: 'calc(100vh - 230px' }}>
                          <div className={classes.customScroll}>
                            {casesheetInfo ? <CaseSheet /> : null}
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
                          disableChat={disableChat()}
                          isNewMessage={(isNewMessage: boolean) => setIsNewMessage(isNewMessage)}
                          autoCloseCaseSheet={autoCloseCaseSheet}
                          setSessionError={setSessionError}
                          setPublisherError={setPublisherError}
                          setSubscriberError={setSubscriberError}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div ref={scrollbars} />
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
              if (document.getElementById('activeConsult')) {
                document.getElementById('activeConsult')!.click();
              }
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!isDialogOpen && jrdNoFillDialog}
        onClose={() => setJrdNoFillDialog(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.popoverTile}>Apollo 24x7 - Alert</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hi! Seems like you've gone offline. Please click on 'OK' to continue chatting with your
            patient.
            <div className={classes.countdownLoader}>
              <ReactCountdownClock
                seconds={60}
                color="#fcb716"
                alpha={0.9}
                size={50}
                onComplete={() => triggerAutoEndConsult()}
              />
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setJrdNoFillDialog(false);
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      {/* Ot Errors Start */}
      <Alert
        error={sessionError}
        onClose={() => {
          setSessionError(null);
        }}
      />
      <Alert
        error={publisherError}
        onClose={() => {
          setPublisherError(null);
        }}
      />
      <Alert
        error={subscriberError}
        onClose={() => {
          setSubscriberError(null);
        }}
      />
      {/* Ot Errors Ends */}
    </div>
  );
};
