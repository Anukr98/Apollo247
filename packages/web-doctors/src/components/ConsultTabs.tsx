import React, { useState, useEffect, useContext } from 'react';
import { Theme, Button, Modal } from '@material-ui/core';
import { useParams } from 'hooks/routerHooks';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import Paper from '@material-ui/core/Paper';
import { CallPopover } from 'components/CallPopover';
import ApolloClient from 'apollo-client';
import Pubnub from 'pubnub';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { ConsultRoom } from 'components/ConsultRoom';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { useApolloClient } from 'react-apollo-hooks';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { DOWNLOAD_DOCUMENTS } from 'graphql/profiles';
import { downloadDocuments } from 'graphql/types/downloadDocuments';
import {
  REQUEST_ROLES,
  Gender,
  DOCTOR_CALL_TYPE,
  APPT_CALL_TYPE,
  STATUS,
} from 'graphql/types/globalTypes';
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
  EndCallNotification,
  EndCallNotificationVariables,
} from 'graphql/types/EndCallNotification';
import { CasesheetView } from 'components/CasesheetView';
import { APPOINTMENT_TYPE } from '../graphql/types/globalTypes';
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
  GET_CASESHEET_JRD,
  END_APPOINTMENT_SESSION,
  CREATE_CASESHEET_FOR_SRD,
  MODIFY_CASESHEET,
  UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS,
} from 'graphql/profiles';
import { ModifyCaseSheet, ModifyCaseSheetVariables } from 'graphql/types/ModifyCaseSheet';
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
import { CaseSheet } from 'components/case-sheet/CaseSheet';
import { useAuth } from 'hooks/authHooks';
import { CaseSheetContext } from 'context/CaseSheetContext';
import Scrollbars from 'react-custom-scrollbars';
import { useMutation } from 'react-apollo-hooks';
import { ApolloError } from 'apollo-client';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { clientRoutes } from 'helpers/clientRoutes';
import { SEND_CALL_NOTIFICATION, END_CALL_NOTIFICATION } from 'graphql/consults';
import {
  SendCallNotification,
  SendCallNotificationVariables,
} from 'graphql/types/SendCallNotification';
import moment from 'moment';
// import bugsnag from '@bugsnag/js';

// const bugsnagClient = bugsnag({
//   apiKey: `${process.env.BUGSNAG_API_KEY}`,
//   releaseStage: `${process.env.NODE_ENV}`,
//   autoBreadcrumbs: true,
//   autoCaptureSessions: true,
//   autoNotify: true,
// });

// const sessionClient = bugsnagClient.startSession();
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
      outline: 'none',
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
    fadedBg: {
      position: 'fixed',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      opacity: 0,
      zIndex: 999,
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
    stickyConsultTabs: {
      position: 'sticky',
      top: 94,
      zIndex: 2,
    },
  };
});

type Params = { id: string; patientId: string; tabValue: string };
const storageClient = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);
interface MessagesObjectProps {
  id: string;
  message: string;
  username: string;
  automatedText: string;
  duration: string;
  url: string;
  messageDate: string;
  sentBy: string;
  type: string;
}
let insertText: MessagesObjectProps[] = [];
export const ConsultTabs: React.FC = () => {
  const classes = useStyles();
  const params = useParams<Params>();
  const paramId = params.id;

  const { currentPatient, isSignedIn, sessionClient } = useAuth();

  const mutationCreateSrdCaseSheet = useMutation<
    CreateSeniorDoctorCaseSheet,
    CreateSeniorDoctorCaseSheetVariables
  >(CREATE_CASESHEET_FOR_SRD, {
    variables: {
      appointmentId: paramId,
    },
  });
  const [patientId, setpatientId] = useState<string>(params.patientId);
  const [appointmentId, setAppointmentId] = useState<string>(paramId);
  const [tabValue, setTabValue] = useState<number>(
    params && params!.tabValue && params!.tabValue !== null && params!.tabValue !== ''
      ? parseInt(params!.tabValue, 10)
      : 0
  );
  const [urlToPatient, setUrlToPatient] = useState<boolean>(false);
  const [prescriptionPdf, setPrescriptionPdf] = useState<string>('');
  const [startConsult, setStartConsult] = useState<string>('');

  const [isPdfPageOpen, setIsPdfPageOpen] = useState<boolean>(false);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [appointmentDateTime, setappointmentDateTime] = useState<string>('');
  const [doctorId, setdoctorId] = useState<string>(currentPatient ? currentPatient.id : '');

  const [caseSheetId, setCaseSheetId] = useState<string>('');
  const [casesheetInfo, setCasesheetInfo] = useState<any>(null);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [callId, setcallId] = useState<string>('');
  const [chatRecordId, setChatRecordId] = useState<string>('');

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
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<any[] | null>(null);
  const [favouriteTests, setFavouriteTests] = useState<any[] | null>(null);
  const [medicinePrescription, setMedicinePrescription] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null
  >(null);
  const [favouriteMedicines, setFavouriteMedicines] = useState<
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
  const isSecretary = currentUserType === LoggedInUserType.SECRETARY;
  const [lastMsg, setLastMsg] = useState<any>(null);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [presenceEventObject, setPresenceEventObject] = useState<any>(null);

  const subscribekey: string = process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '';
  const publishkey: string = process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '';
  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribekey,
    publishKey: publishkey,
    ssl: true,
    restore: true,
    keepAlive: true,
    //autoNetworkDetection: true,
    //listenToBrowserNetworkEvents: true,
    presenceTimeout: 20,
    heartbeatInterval: 20,
    uuid: REQUEST_ROLES.DOCTOR,
  };
  useEffect(() => {
    if (startAppointment) {
      //followUp[0] = startAppointment;
      //setFollowUp(followUp);
    }
  }, [startAppointment]);
  const pubnub = new Pubnub(config);

  useEffect(() => {
    pubnub.subscribe({
      channels: [appointmentId],
      withPresence: true,
    });
    getHistory(0);
    pubnub.addListener({
      status(statusEvent: any) {},
      message(message: any) {
        insertText[insertText.length] = message.message;
        setMessages(() => [...insertText]);
        if (
          message.message.url &&
          message.message.fileType &&
          message.message.fileType === 'image'
        ) {
          const data = {
            documentPath: message.message.url,
          };
          setDocumentArray(data);
        }

        setLastMsg(message);
      },
      presence(presenceEvent: any) {
        pubnub
          .hereNow({
            channels: [appointmentId],
            includeUUIDs: true,
          })
          .then((response: any) => {
            setPresenceEventObject(response);
          })
          .catch((error) => {
            console.log(error);
          });
      },
    });
    return () => {
      pubnub.unsubscribe({ channels: [appointmentId] });
    };
  }, []);
  const getPrismUrls = (client: ApolloClient<object>, patientId: string, fileIds: string[]) => {
    return new Promise((res, rej) => {
      client
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENTS,
          fetchPolicy: 'no-cache',
          variables: {
            downloadDocumentsInput: {
              patientId: patientId,
              fileIds: fileIds,
            },
          },
        })
        .then(({ data }) => {
          res({ urls: data.downloadDocuments.downloadPaths });
        })
        .catch((e: any) => {
          const error = JSON.parse(JSON.stringify(e));
          rej({ error: e });
        });
    });
  };
  const getHistory = (timetoken: number) => {
    pubnub.history(
      {
        channel: appointmentId,
        reverse: true,
        count: 1000,
        stringifiedTimeToken: true,
        start: timetoken,
      },
      (status: any, res: any) => {
        const newmessage: MessagesObjectProps[] = messages;
        res.messages.forEach((element: any, index: number) => {
          let item = element.entry;
          if (item.prismId) {
            getPrismUrls(client, patientId, item.prismId).then((data: any) => {
              item.url = (data && data.urls[0]) || item.url;
            });
            newmessage[index] = item;
          } else {
            newmessage.push(element.entry);
          }
        });
        insertText = newmessage;
        setMessages(newmessage);
        const end: number = res.endTimeToken ? res.endTimeToken : 1;
        if (res.messages.length == 100) {
          getHistory(end);
        }
      }
    );
  };
  /* case sheet data*/
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
            _data.data.getCaseSheet.juniorDoctorCaseSheet.updatedDate
          ) {
            setJrdSubmitDate(_data.data.getCaseSheet.juniorDoctorCaseSheet.updatedDate);
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
          setJrdName(`${jrdFirstName} ${jrdLastName}`);
          if (
            _data &&
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet &&
            _data.data.getCaseSheet.juniorDoctorCaseSheet.updatedDate
          ) {
            setJrdSubmitDate(_data.data.getCaseSheet.juniorDoctorCaseSheet.updatedDate);
          }
        })
        .catch((error: ApolloError) => {
          const networkErrorMessage = error.networkError ? error.networkError.message : null;
          const allMessages = error.graphQLErrors
            .map((e) => e.message)
            .concat(networkErrorMessage ? networkErrorMessage : []);
          const isCasesheetNotExists = allMessages.includes(AphErrorMessages.NO_CASESHEET_EXIST);
          if (isCasesheetNotExists) {
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
                const patientName =
                  casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
                  ' ' +
                  casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
                const logObject = {
                  api: 'CreateSeniorDoctorCaseSheet',
                  appointmentId: appointmentId,
                  doctorId: currentPatient!.id,
                  doctorDisplayName: currentPatient!.displayName,
                  patientId: params.patientId,
                  patientName: patientName,
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

    if (isSecretary) {
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
            patientFamilyHistory && patientFamilyHistory!.description
              ? patientFamilyHistory!.description
              : ''
          );

          setLifeStyle(
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
                .diagnosticPrescription as unknown) as any[])
            : setDiagnosticPrescription([]);
          _data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!.medicinePrescription
            ? setMedicinePrescription((_data!.data!.getJuniorDoctorCaseSheet!.caseSheetDetails!
                .medicinePrescription as unknown) as GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription[])
            : setMedicinePrescription([]);

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

          // patient medical and family history
          if (
            _data &&
            _data.data &&
            _data.data.getJuniorDoctorCaseSheet &&
            _data.data.getJuniorDoctorCaseSheet.patientDetails &&
            _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
          ) {
            setBp(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory.bp || ''
            );
            setDietAllergies(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                .dietAllergies || ''
            );
            setDrugAllergies(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                .drugAllergies || ''
            );
            setHeight(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory.height || ''
            );
            setMenstrualHistory(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                .menstrualHistory || ''
            );
            setPastMedicalHistory(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                .pastMedicalHistory || ''
            );
            setPastSurgicalHistory(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                .pastSurgicalHistory || ''
            );
            setTemperature(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory
                .temperature || ''
            );
            setWeight(
              _data.data.getJuniorDoctorCaseSheet.patientDetails.patientMedicalHistory.weight || ''
            );

            // set Jrd name and Jrd Casesheet submit date.
            let jrdSalutation = '',
              jrdFirstName = '',
              jrdLastName = '';
            if (
              _data &&
              _data.data &&
              _data.data.getJuniorDoctorCaseSheet &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.updatedDate
            ) {
              setJrdSubmitDate(
                _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.updatedDate
              );
            }

            if (
              _data &&
              _data.data &&
              _data.data.getJuniorDoctorCaseSheet &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile
                .firstName
            ) {
              jrdFirstName =
                _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile
                  .firstName;
            }

            if (
              _data &&
              _data.data &&
              _data.data.getJuniorDoctorCaseSheet &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile &&
              _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile
                .lastName
            ) {
              jrdLastName =
                _data.data.getJuniorDoctorCaseSheet.juniorDoctorCaseSheet.createdDoctorProfile
                  .lastName;
            }
          }
        })
        .catch((error: ApolloError) => {
          const patientName =
            casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
            ' ' +
            casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
          const logObject = {
            api: 'GetJuniorDoctorCaseSheet',
            appointmentId: appointmentId,
            doctorId: currentPatient!.id,
            doctorDisplayName: currentPatient!.displayName,
            patientId: params.patientId,
            patientName: patientName,
            currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
            appointmentDateTime: moment(new Date(appointmentDateTime)).format(
              'MMMM DD YYYY h:mm:ss a'
            ),
            error: JSON.stringify(error),
          };

          sessionClient.notify(JSON.stringify(logObject));
          const networkErrorMessage = error.networkError ? error.networkError.message : null;
          const allMessages = error.graphQLErrors
            .map((e) => e.message)
            .concat(networkErrorMessage ? networkErrorMessage : []);
          const isCasesheetNotExists = allMessages.includes(AphErrorMessages.NO_CASESHEET_EXIST);
          if (isCasesheetNotExists) {
            setError('Casesheet is not created by Doctor.....');
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

  const sendCallNotificationFn = (callType: APPT_CALL_TYPE, isCall: boolean) => {
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
          if (isCall) {
            const cookieStr = `doctorCallId=${_data.data.sendCallNotification.callDetails.id}`;
            document.cookie = cookieStr + ';path=/;';
            setcallId(_data.data.sendCallNotification.callDetails.id);
          } else {
            setChatRecordId(_data.data.sendCallNotification.callDetails.id);
          }
        }
      })
      .catch((error: ApolloError) => {
        const patientName =
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
          ' ' +
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
        const logObject = {
          api: 'SendCallNotification',
          inputParam: JSON.stringify({
            appointmentId: appointmentId,
            callType: callType,
            doctorType: DOCTOR_CALL_TYPE.SENIOR,
          }),
          appointmentId: appointmentId,
          doctorId: currentPatient!.id,
          doctorDisplayName: currentPatient!.displayName,
          patientId: params.patientId,
          patientName: patientName,
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(error),
        };

        sessionClient.notify(JSON.stringify(logObject));
        console.log('An error occurred while sending notification to Client.');
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
        if (
          _data &&
          _data!.data!.updatePatientPrescriptionSentStatus &&
          _data!.data!.updatePatientPrescriptionSentStatus.blobName
        ) {
          const url = storageClient.getBlobUrl(
            _data!.data!.updatePatientPrescriptionSentStatus.blobName
          );
          setPrescriptionPdf(url);
        }
        setAppointmentStatus('COMPLETED');
        setSentToPatient(true);
        setIsPdfPageOpen(true);
        setUrlToPatient(true);
      })
      .catch((e) => {
        const patientName =
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
          ' ' +
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
        const logObject = {
          api: 'UpdatePatientPrescriptionSentStatus',
          inputParam: JSON.stringify({
            caseSheetId: caseSheetId,
            sentToPatient: true,
          }),
          appointmentId: appointmentId,
          doctorId: currentPatient!.id,
          doctorDisplayName: currentPatient!.displayName,
          patientId: params.patientId,
          patientName: patientName,
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(error),
        };

        sessionClient.notify(JSON.stringify(logObject));
        setError('Error occured while sending prescription to patient');
        console.log('Error occured while sending prescription to patient', e);
        setSaving(false);
      });
  };

  const saveCasesheetAction = (flag: boolean, sendToPatientFlag: boolean) => {
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
      const diagnosticPrescriptionFinal1 = diagnosticPrescription.map((prescription) => {
        return _omit(prescription, ['__typename']);
      });
      // convert itemName to itemname
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
    setSaving(true);

    // this needs to be fixed.
    const followupISODate = new Date(followUpDate[0]).toISOString();
    const followupDateArray = followupISODate.split('T');
    const inputVariables = {
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
    };
    client
      .mutate<ModifyCaseSheet, ModifyCaseSheetVariables>({
        mutation: MODIFY_CASESHEET,
        variables: {
          ModifyCaseSheetInput: inputVariables,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (!flag) {
          setIsConfirmDialogOpen(true);
        }
        if (sendToPatientFlag) {
          sendToPatientAction();
        }
        setSaving(false);
      })
      .catch((e) => {
        const patientName =
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
          ' ' +
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
        const logObject = {
          api: 'ModifyCaseSheet',
          inputParam: JSON.stringify(inputVariables),
          appointmentId: appointmentId,
          doctorId: currentPatient!.id,
          doctorDisplayName: currentPatient!.displayName,
          patientId: params.patientId,
          patientName: patientName,
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
        endCallNotificationAction(false);
        setAppointmentStatus('COMPLETED');
        const text = {
          id: doctorId,
          message: '^^#appointmentComplete',
          isTyping: true,
          messageDate: new Date(),
          sentBy: REQUEST_ROLES.DOCTOR,
        };
        pubnub.publish(
          {
            message: text,
            channel: appointmentId,
            storeInHistory: true,
          },
          (status: any, response: any) => {}
        );
        setIsPdfPageOpen(true);
      })
      .catch((e) => {
        const patientName =
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
          ' ' +
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
        const logObject = {
          api: 'EndAppointmentSession',
          inputParam: JSON.stringify({
            appointmentId: appointmentId,
            status: STATUS.COMPLETED,
          }),
          appointmentId: appointmentId,
          doctorId: currentPatient!.id,
          doctorDisplayName: currentPatient!.displayName,
          patientId: params.patientId,
          patientName: patientName,
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(e),
        };

        sessionClient.notify(JSON.stringify(logObject));
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
        setAppointmentStatus(STATUS.IN_PROGRESS);
        setsessionId(_data.data.createAppointmentSession.sessionId);
        settoken(_data.data.createAppointmentSession.appointmentToken);
        sendCallNotificationFn(APPT_CALL_TYPE.CHAT, false);
        setError('');
        setSaving(false);
      })
      .catch((e: any) => {
        const patientName =
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
          ' ' +
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
        const logObject = {
          api: 'CreateAppointmentSession',
          inputParam: JSON.stringify({
            appointmentId: paramId,
            requestRole: REQUEST_ROLES.DOCTOR,
          }),
          appointmentId: appointmentId,
          doctorId: currentPatient!.id,
          doctorDisplayName: currentPatient!.displayName,
          patientId: params.patientId,
          patientName: patientName,
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(error),
        };

        sessionClient.notify(JSON.stringify(logObject));
        setError('Error occured creating session');
        console.log('Error occured creating session', e);
        setSaving(false);
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

  const startAppointmentClick = (startAppointment: boolean) => {
    setStartAppointment(startAppointment);
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
        const patientName =
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.firstName +
          ' ' +
          casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.lastName;
        const logObject = {
          api: 'EndCallNotification',
          inputParam: JSON.stringify({
            appointmentCallId: isCall ? callId : chatRecordId,
          }),
          appointmentId: appointmentId,
          doctorId: currentPatient!.id,
          doctorDisplayName: currentPatient!.displayName,
          patientId: params.patientId,
          patientName: patientName,
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

  return (
    <div className={classes.consultRoom}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      {!loaded && (
        <div>
          <CircularProgress className={classes.loading} /> <div className={classes.fadedBg}></div>
        </div>
      )}

      {saving && (
        <span>
          <CircularProgress className={classes.loading} />
          <div className={classes.fadedBg}></div>
        </span>
      )}

      {error && error !== '' && <Typography className={classes.tabRoot}>{error}</Typography>}
      {loaded && error === '' && (
        <CaseSheetContext.Provider
          value={{
            loading: !loaded,
            caseSheetId: appointmentId,
            documentArray,
            setDocumentArray,
            patientDetails: isSecretary
              ? casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails
              : casesheetInfo!.getCaseSheet!.patientDetails,
            appointmentInfo: isSecretary
              ? casesheetInfo!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment
              : casesheetInfo!.getCaseSheet!.caseSheetDetails!.appointment,
            createdDoctorProfile:
              !isSecretary && casesheetInfo!.getCaseSheet!.caseSheetDetails!.createdDoctorProfile,
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
            favouriteTests,
            setFavouriteTests,
            medicinePrescription,
            setMedicinePrescription,
            favouriteMedicines,
            setFavouriteMedicines,
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
            healthVault: isSecretary
              ? casesheetInfo!.getJuniorDoctorCaseSheet!.patientDetails!.healthVault
              : casesheetInfo!.getCaseSheet!.patientDetails!.healthVault,
            appointmentDocuments: isSecretary
              ? casesheetInfo!.getJuniorDoctorCaseSheet!.caseSheetDetails!.appointment!
                  .appointmentDocuments
              : casesheetInfo!.getCaseSheet!.caseSheetDetails!.appointment!.appointmentDocuments,
            pastAppointments: isSecretary
              ? casesheetInfo!.getJuniorDoctorCaseSheet!.pastAppointments
              : casesheetInfo!.getCaseSheet!.pastAppointments,
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
                setIsPdfPageOpen={(flag: boolean) => setIsPdfPageOpen(flag)}
                pubnub={pubnub}
                sessionClient={sessionClient}
                lastMsg={lastMsg}
                presenceEventObject={presenceEventObject}
                endCallNotificationAction={(callId: boolean) => endCallNotificationAction(callId)}
              />
              <div>
                <div
                  className={
                    !isPdfPageOpen ||
                    isSecretary ||
                    (params && params.tabValue && parseInt(params.tabValue, 10) === 1)
                      ? classes.block
                      : classes.none
                  }
                >
                  <div className={classes.stickyConsultTabs}>
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
                        classes={{
                          root: classes.tabRoot,
                          selected: classes.tabSelected,
                        }}
                        label="Case Sheet"
                      />
                      <Tab
                        classes={{
                          root: classes.tabRoot,
                          selected: classes.tabSelected,
                        }}
                        label="Chat"
                      />
                    </Tabs>
                  </div>
                  <div>
                    <div className={tabValue !== 0 ? classes.none : classes.block}>
                      {casesheetInfo ? <CaseSheet startAppointment={startAppointment} /> : ''}
                    </div>
                  </div>

                  <div>
                    <div className={tabValue !== 1 ? classes.none : classes.block}>
                      <div className={classes.chatContainer}>
                        <ConsultRoom
                          startConsult={startConsult}
                          sessionId={sessionId}
                          token={token}
                          appointmentId={paramId}
                          doctorId={doctorId}
                          patientId={patientId}
                          pubnub={pubnub}
                          sessionClient={sessionClient}
                          lastMsg={lastMsg}
                          messages={messages}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    !isPdfPageOpen ||
                    isSecretary ||
                    (params && params.tabValue && parseInt(params.tabValue, 10) === 1)
                      ? classes.none
                      : classes.block
                  }
                >
                  <CasesheetView saving={saving} />
                </div>
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
            <h3>Are you sure you want to end your consult?</h3>

            <Button className={classes.cancelConsult} onClick={() => setIsConfirmDialogOpen(false)}>
              No
            </Button>
            <Button
              className={classes.consultButton}
              onClick={() => {
                endConsultActionFinal();
                setIsConfirmDialogOpen(false);
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
    </div>
  );
};
