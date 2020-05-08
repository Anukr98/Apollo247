import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Theme, Button, Avatar, Modal, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Pubnub from 'pubnub';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import moment from 'moment';
import { ApolloError } from 'apollo-client';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import { useParams } from 'hooks/routerHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import Paper from '@material-ui/core/Paper';
import { OnlineConsult } from 'components/OnlineConsult';
import { Alerts } from 'components/Alerts/Alerts';

import { DoctorChatCard } from 'components/ChatRoom/DoctorChatCard';
import { UPDATE_APPOINTMENT_SESSION } from 'graphql/consult';
import {
  UpdateAppointmentSession,
  UpdateAppointmentSessionVariables,
} from 'graphql/types/UpdateAppointmentSession';
import { useMutation } from 'react-apollo-hooks';
import { ChatVideo } from 'components/ChatRoom/ChatVideo';
import {
  bookRescheduleAppointment,
  bookRescheduleAppointmentVariables,
} from 'graphql/types/bookRescheduleAppointment';
import { BOOK_APPOINTMENT_RESCHEDULE } from 'graphql/profiles';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import { TRANSFER_INITIATED_TYPE, BookRescheduleAppointmentInput } from 'graphql/types/globalTypes';

import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { AddChatDocument, AddChatDocumentVariables } from 'graphql/types/AddChatDocument';
import { useApolloClient } from 'react-apollo-hooks';
import { REQUEST_ROLES } from 'graphql/types/globalTypes';
import { ADD_CHAT_DOCUMENT } from 'graphql/profiles';

// import { GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_appointmentDocuments as appointmentDocument } from 'graphql/types/GetCaseSheet';

type Params = { appointmentId: string; doctorId: string };

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_PATIENTS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

const useStyles = makeStyles((theme: Theme) => {
  return {
    audioVideoContainer: {
      paddingBottom: 0,
    },
    avatar: {
      width: 32,
      height: 32,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    blueBubble: {
      backgroundColor: '#0087ba',
      color: theme.palette.common.white,
      marginBottom: 5,
    },
    boldTxt: {
      fontWeight: 700,
    },
    bubbleActions: {
      display: 'flex',
      paddingTop: 20,
      '& button': {
        marginRight: 5,
        boxShadow: 'none',
        border: '2px solid #fcb715',
        borderRadius: 10,
        fontSize: 13,
        padding: 7,
        backgroundColor: 'transparent',
      },
      '& a': {
        textTransform: 'uppercase',
        width: 'calc(50% - 5px)',
        marginLeft: 5,
        display: 'block',
        fontSize: 13,
        backgroundColor: '#fcb716',
        padding: 10,
        height: 40,
        borderRadius: 10,
        textAlign: 'center',
      },
    },
    patientAvatar: {
      position: 'absolute',
      left: -40,
      bottom: 0,
    },
    callActions: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 10,
    },
    chatImgBubble: {
      // padding: 0,
      // border: 'none',
      // '& img': {
      //   maxWidth: '100%',
      //   verticalAlign: 'middle',
      // },
      maxWidth: '100%',
      verticalAlign: 'middle',
    },
    callEnded: {
      display: 'block',
      '& img': {
        position: 'inherit',
        maxWidth: 20,
      },
    },
    chatSendBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 'auto',
      padding: 0,
      marginLeft: 16,
      paddingTop: 8,
      //display: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    callMsg: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      marginRight: 32,
      lineHeight: 'normal',
      '& img': {
        position: 'relative',
        top: 5,
        marginRight: 7,
        width: 'auto',
        left: 0,
      },
    },
    callPickIcon: {
      padding: 0,
      boxShadow: 'none',
      minWidth: 'auto',
      backgroundColor: 'transparent',
      '&:hover': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
      '&:focus': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
    },
    changeSlotBtn: {
      width: 'calc(65% - 5px) !important',
    },
    chatBub: {
      padding: '6px 16px',
      color: '#02475b',
    },
    chatBubble: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      padding: '12px 16px',
      color: '#01475b',
      fontSize: 15,
      fontWeight: 500,
      textAlign: 'left',
      display: 'inline-block',
      borderRadius: 10,
      maxWidth: 244,
      wordBreak: 'break-word',
    },
    chatBubbledoc: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      padding: '12px 16px',
      color: '#01475b',
      fontSize: 15,
      fontWeight: 500,
      textAlign: 'left',
      display: 'inline-block',
      borderRadius: 10,
      maxWidth: 244,
      wordBreak: 'break-word',
      margin: '0 0 10px 40px',
    },
    chatContainer: {
      paddingRight: 5,
    },
    chatContainerScroll: {
      '& > div': {
        overflow: 'auto !important',
      },
    },
    callOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.2)',
      top: 0,
      left: 0,
    },
    chatSection: {
      position: 'relative',
      paddingBottom: 10,
    },
    chatSubmitBtn: {
      position: 'absolute',
      bottom: 14,
      right: 0,
      minWidth: 'auto',
      padding: 0,
      boxShadow: 'none',
    },
    chatWindowContainer: {
      position: 'relative',
    },
    chatWindowFooter: {
      borderTop: 'solid 0.5px rgba(2,71,91,0.5)',
      paddingTop: 12,
      position: 'relative',
      margin: '20px 20px 0 20px',
    },
    consultRoom: {
      paddingTop: 0,
      paddingBottom: 0,
    },
    customScroll: {
      paddingLeft: 20,
      paddingRight: 17,
    },
    modalBox: {
      maxWidth: 676,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: theme.palette.common.white,
      position: 'relative',
      outline: 'none',
    },
    modalBoxClose: {
      position: 'absolute',
      right: -48,
      top: 0,
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        right: 0,
        top: -48,
      },
    },
    doctorChatBubble: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      backgroundColor: theme.palette.common.white,
      fontSize: 15,
      fontWeight: 500,
      color: '#0087ba',
      padding: '12px 16px',
      width: 245,
    },
    doctorImg: {
      position: 'absolute',
      left: 0,
      bottom: 0,
    },
    doctorChatWindow: {
      position: 'relative',
      paddingLeft: 38,
      marginBottom: 10,
    },
    imageUpload: {
      overflow: 'hidden',
      borderRadius: 10,
      width: 130,
      cursor: 'pointer',
      margin: '0 0 10px 40px',
      '& img': {
        maxWidth: '100%',
      },
    },
    durattiocallMsg: {
      marginLeft: 40,
      marginTop: 7,
    },
    durationMsg: {
      fontSize: 10,
      marginTop: 2,
      display: 'block',
    },
    incomingCallContainer: {
      position: 'absolute',
      right: 17,
      top: 0,
    },
    incomingCallWindow: {
      position: 'relative',
      width: 154,
      height: 204,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.6)',
      overflow: 'hidden',
      '& img': {
        maxHeight: 204,
        verticalAlign: 'middle',
      },
    },
    patientChat: {
      padding: '5px 0',
      textAlign: 'right',
    },
    timeStamp: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      marginRight: -7,
      marginBottom: -5,
      paddingTop: 5,
    },
    timeStampImg: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      paddingTop: 5,
    },
    missCall: {
      color: '#890000',
      backgroundColor: 'rgba(229, 0, 0, 0.1)',
      borderRadius: 10,
      padding: '5px 20px',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '24px',
    },
    none: {
      display: 'block',
    },
    doctorAvatar: {
      position: 'absolute',
    },
    petient: {
      color: '#fff',
      textAlign: 'left',
      padding: 12,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      backgroundColor: '#0087ba',
      fontSize: 15,
      maxWidth: 240,
      margin: '0 0 10px 40px',
    },
    doctorsChat: {
      display: 'flex',
      position: 'relative',
    },
    searchInput: {
      '& input': {
        paddingTop: 10,
        paddingRight: 25,
        paddingBottom: 14,
        minHeight: 25,
      },
    },
    topText: {
      textAlign: 'center',
      color: '#fff',
      fontSize: 14,
      fontWeight: 500,
      paddingTop: 10,
    },
    viewButton: {
      width: 'calc(50% - 5px)',
      marginLeft: 5,
      display: 'block',
      fontSize: 13,
      backgroundColor: '#fcb716',
      padding: 10,
      height: 40,
      borderRadius: 10,
      marginRight: 0,
      '&:hover': {
        backgroundColor: '#fcb716 !important',
      },
    },
    chatTime: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      color: 'rgba(255, 255, 255, 0.6)',
      margin: '10px 0 0 0',
    },
    defaultChatTime: {
      color: 'rgba(2, 71, 91, 0.6)',
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    scheduledText: {
      padding: '0 0 10px 0',
    },
    scheduledTextTwo: {
      padding: '10px 0',
    },
    dashedBorderBottom: {
      borderBottom: '1px dashed rgba(255,255,255,0.5)',
    },
    actions: {
      padding: '0 20px 20px 20px',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        color: '#fc9916',
        padding: 0,
        boxShadow: 'none',
        '&:last-child': {
          marginLeft: 'auto',
        },
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    chatFooterSection: {
      position: 'absolute',
      padding: '40px 20px 20px 20px',
      clear: 'both',
      backgroundColor: '#fff',
      width: '100%',
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
      '& >div': {
        display: 'flex',
        '& button': {
          boxShadow: 'none',
          padding: 0,
          paddingTop: 8,
          minWidth: 'auto',
        },
      },
    },
    addImgBtn: {
      background: 'transparent',
      minWidth: 35,
      maxWidth: 35,
      boxShadow: 'none',
      '&:hover': {
        background: 'transparent',
      },
    },
    inputWidth: {
      align: 'left',
    },
    modalWindowWrap: {
      display: 'table',
      height: '100%',
      width: '100%',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    tableContent: {
      display: 'table-cell',
      verticalAlign: 'middle',
      width: '100%',
      '&:focus': {
        outline: 'none',
      },
    },
    modalWindow: {
      backgroundColor: theme.palette.common.black,
      maxWidth: 600,
      margin: 'auto',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.2)',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    modalHeader: {
      minHeight: 56,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 0.5,
      color: theme.palette.common.white,
      padding: '16px 50px',
      textTransform: 'uppercase',
      position: 'relative',
      wordBreak: 'break-word',
    },
    modalClose: {
      position: 'absolute',
      right: 16,
      top: 16,
      width: 24,
      height: 24,
      cursor: 'pointer',
    },
    modalFooter: {
      height: 56,
      textAlign: 'center',
      padding: 16,
      textTransform: 'uppercase',
    },
    modalContent: {
      textAlign: 'center',
      maxHeight: 'calc(100vh - 212px)',
      overflow: 'hidden',
      '& img': {
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 212px)',
      },
    },
  };
});

interface MessagesObjectProps {
  id: string;
  message: string;
  automatedText: string;
  username: string;
  text: string;
  duration: string;
  url: string;
  transferInfo: any;
  messageDate: string;
}

interface ChatWindowProps {
  appointmentId: string;
  doctorId: string;
  hasDoctorJoined: (hasDoctorJoined: boolean) => void;
  doctorDetails: DoctorDetails;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  nextSlotAvailable: string;
  availableNextSlot: (slotDoctorId: string, todayDate: Date) => void;
  rescheduleAPI: (bookRescheduleInput: BookRescheduleAppointmentInput) => void;
  jrDoctorJoined: boolean;
  setJrDoctorJoined: (jrDoctorJoined: boolean) => void;
}

interface AutoMessageStrings {
  videoCallMsg: string;
  audioCallMsg: string;
  stopcallMsg: string;
  acceptedcallMsg: string;
  startConsult: string;
  stopConsult: string;
  rescheduleconsult: string;
  consultPatientStartedMsg: string;
  firstMessage: string;
  secondMessage: string;
  typingMsg: string;
  covertVideoMsg: string;
  covertAudioMsg: string;
  followupconsult: string;
  documentUpload: string;
  startConsultjr: string;
  stopConsultjr: string;
  cancelConsultInitiated: string;
  callAbandonment: string;
  appointmentComplete: string;
  transferconsult: string;
  languageQue: string;
  jdThankyou: string;
}
let timerIntervalId: any;
let stoppedConsulTimer: number;
export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const classes = useStyles({});
  const { doctorDetails } = props;
  const autoMessageStrings: AutoMessageStrings = {
    videoCallMsg: '^^callme`video^^',
    audioCallMsg: '^^callme`audio^^',
    stopcallMsg: '^^callme`stop^^',
    acceptedcallMsg: '^^callme`accept^^',
    startConsult: '^^#startconsult',
    stopConsult: '^^#stopconsult',
    rescheduleconsult: '^^#rescheduleconsult',
    consultPatientStartedMsg: '^^#PatientConsultStarted',
    firstMessage: '^^#firstMessage',
    secondMessage: '^^#secondMessage',
    typingMsg: '^^#typing',
    covertVideoMsg: '^^convert`video^^',
    covertAudioMsg: '^^convert`audio^^',
    followupconsult: '^^#followupconsult',
    documentUpload: '^^#DocumentUpload',
    startConsultjr: '^^#startconsultJr',
    stopConsultjr: '^^#stopconsultJr',
    cancelConsultInitiated: '^^#cancelConsultInitiated',
    callAbandonment: '^^#callAbandonment',
    appointmentComplete: '^^#appointmentComplete',
    transferconsult: '^^#transferconsult',
    languageQue: '^^#languageQue',
    jdThankyou: '^^#jdThankyou',
  };
  const profileImage =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.photoUrl
      : '';
  const displayName =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.lastName
      : '';
  const { currentPatient } = useAllCurrentPatients();
  const currentUserId = (currentPatient && currentPatient.id) || '';
  const params = useParams<Params>();
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesObjectProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [isStartConsult, setStartConsult] = useState<boolean>(false);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  const [startTimerAppoinmentt, setstartTimerAppoinmentt] = React.useState<boolean>(false);
  const [startingTime, setStartingTime] = useState<number>(0);

  const timerMinuts = Math.floor(startingTime / 60);
  const timerSeconds = startingTime - timerMinuts * 60;
  const timerLastMinuts = Math.floor(startingTime / 60);
  const timerLastSeconds = startingTime - timerMinuts * 60;

  const [isRescheduleSuccess, setIsRescheduleSuccess] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [fileUploading, setFileUploading] = React.useState<boolean>(false);
  const [fileUploadErrorMessage, setFileUploadErrorMessage] = React.useState<string>('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [imgPrevUrl, setImgPrevUrl] = React.useState();
  // const { documentArray, setDocumentArray } = useContext(CaseSheetContext);
  const [documentArray, setDocumentArray] = React.useState();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [rescheduledSlot, setRescheduledSlot] = useState<string | null>(null);

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const [audio] = useState(
    new Audio('https://mrrhealthcheck-stage.azurewebsites.net/Images/Passes/NotifySound.mp3')
  );
  const [playing, setPlaying] = useState(false);
  const toggle = () => setPlaying(!playing);

  const [doctorJoined, setDoctorJoined] = React.useState<boolean>(false);
  const [reschedule, setReschedule] = React.useState<boolean>(false);
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  // const client = useApolloClient();
  const mascotRef = useRef(null);
  const apolloClient = useApolloClient();
  const bookAppointment = useMutation(BOOK_APPOINTMENT_RESCHEDULE);
  const [callAudio, setCallAudio] = useState(autoMessageStrings.audioCallMsg);

  const doctorId = props.doctorId;
  const patientId = currentUserId;
  const channel = props.appointmentId;
  const config: Pubnub.PubnubConfig = {
    subscribeKey: process.env.SUBSCRIBE_KEY || '',
    publishKey: process.env.PUBLISH_KEY || '',
    ssl: true,
  };
  const mutationResponse = useMutation<UpdateAppointmentSession, UpdateAppointmentSessionVariables>(
    UPDATE_APPOINTMENT_SESSION,
    {
      variables: {
        UpdateAppointmentSessionInput: {
          appointmentId: channel,
          requestRole: 'PATIENT',
        },
      },
    }
  );

  const updateAppointmentSessionCall = () => {
    mutationResponse()
      .then((data) => {
        let sessionId = '';
        let appointmentToken = '';
        if (data && data.data && data.data.updateAppointmentSession) {
          appointmentToken = data.data.updateAppointmentSession.appointmentToken;
        }
        if (data && data.data && data.data.updateAppointmentSession.sessionId) {
          sessionId = data.data.updateAppointmentSession.sessionId;
        }
        setsessionId(sessionId);
        settoken(appointmentToken);
      })
      .catch(() => {
        setIsAlertOpen(true);
        setAlertMessage('An error occurred while loading :(');
      });
  };
  const setCookiesAcceptcall = () => {
    const cookieStr = `action=${
      callAudio === autoMessageStrings.videoCallMsg ? 'videocall' : 'audiocall'
    }`;
    document.cookie = cookieStr + ';path=/;';
  };

  //Audio and video ring toon
  const [ring, setRing] = useState(false);
  useEffect(() => {
    if (ring) {
      var playPromise = audio.play();
      setPlaying(playing);
      playing ? audio.play() : audio.pause();
      if (audio.pause) {
        audio.play();
      } else {
        audio.currentTime = 0;
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(!playing);
    }
  }, [ring]);

  // useEffect(() => {
  //   playing ? audio.play() : audio.pause();
  // }, [playing])

  const pubnub = new Pubnub(config);
  let leftComponent = 0;
  let rightComponent = 0;
  let insertText: MessagesObjectProps[] = [];

  // Start of Explaining the steps to patient with message.

  const successSteps = `Let’s get you feeling better in 5 simple steps :),
    1. Answer some quick questions
    2. Connect with your doctor
    3. Get a prescription and meds, if necessary
    4. Avail 1 free follow-up*
    5. Chat with your doctor**
    * 7 days after your first consultation.
    
    A doctor from ’s team will join you shortly to collect your medical details. These details are essential for to help you and will take around 3-5 minutes.`;

  const automatedTextFromPatient = () => {
    const text = {
      channel: channel,
      message: autoMessageStrings.consultPatientStartedMsg,
      automatedText: successSteps,
      id: doctorId,
      messageDate: new Date(),
      isTyping: true,
      storeInHistory: true,
      sendByPost: true,
    };
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
  };

  const checkAutomatedPatientText = () => {
    const result = insertText.filter((obj: any) => {
      return obj.message === autoMessageStrings.consultPatientStartedMsg;
    });
    if (result.length === 0) {
      automatedTextFromPatient();
    }
  };
  const rescheduleAPI = (bookRescheduleInput: BookRescheduleAppointmentInput) => {
    bookAppointment({
      variables: {
        bookRescheduleAppointmentInput: bookRescheduleInput,
      },
      fetchPolicy: 'no-cache',
    })
      .then((data: any) => {
        setIsPopoverOpen(false);
        setRescheduledSlot(bookRescheduleInput.newDateTimeslot);
        window.location.href = clientRoutes.appointments();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const availableSlot = (slotDoctorId: string, todayDate: any) =>
    apolloClient.query<GetDoctorNextAvailableSlot, GetDoctorNextAvailableSlotVariables>({
      query: GET_DOCTOR_NEXT_AVAILABILITY,
      variables: {
        DoctorNextAvailableSlotInput: {
          doctorIds: [slotDoctorId],
          availableDate: moment(todayDate).format('YYYY-MM-DD'),
        },
      },
    });
  const nextAvailableSlot = (slotDoctorId: string, date: Date) => {
    const todayDate = moment
      .utc(date)
      .local()
      .format('YYYY-MM-DD');
    availableSlot(slotDoctorId, todayDate)
      .then(({ data }: any) => {
        try {
          if (
            data &&
            data.getDoctorNextAvailableSlot &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
          ) {
            setNextSlotAvailable(
              data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
            );
          }
        } catch (error) {
          setNextSlotAvailable('');
          setIsAlertOpen(true);
          setAlertMessage(error);
        }
      })
      .catch((e: string) => {
        setIsAlertOpen(true);
        setAlertMessage('something went wrong');
        console.log(e);
      });
  };

  // videocall and audio call
  // ---------------------------------

  const toggelChatVideo = () => {
    setIsNewMsg(false);
    setShowVideoChat(!showVideoChat);
    srollToBottomAction();
  };
  const autoSend = () => {
    const text = {
      id: patientId,
      message: autoMessageStrings.stopcallMsg,
      isTyping: true,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
  };
  const actionBtn = () => {
    const text = {
      id: patientId,
      message: autoMessageStrings.acceptedcallMsg,
      isTyping: true,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
    updateAppointmentSessionCall();
    startIntervalTimer(0);
    setCookiesAcceptcall();
    audio.pause();
    setShowVideo(true);
    setPlaying(!playing);
  };

  const stopAudioVideoCall = () => {
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const stoptext = {
      id: patientId,
      message: `${isVideoCall ? 'Video' : 'Audio'} call ended`,
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds} `,
      isTyping: true,
    };
    pubnub.publish(
      {
        channel: channel,
        message: stoptext,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
    stopIntervalTimer();
    autoSend();
    setShowVideo(false);
    setIsVideoCall(false);
    setIsCalled(false);
  };
  const stopConsultCall = () => {
    autoSend();
    setShowVideo(false);
    setShowVideoChat(false);
    setIsVideoCall(false);
    setIsCalled(false);
  };

  const convertCall = () => {
    setConvertVideo(!convertVideo);
    setTimeout(() => {
      pubnub.publish(
        {
          message: {
            isTyping: true,
            message: convertVideo
              ? autoMessageStrings.covertVideoMsg
              : autoMessageStrings.covertAudioMsg,
            messageDate: new Date(),
            sentBy: REQUEST_ROLES.PATIENT,
          },
          channel: channel,
          storeInHistory: false,
        },
        (status: any, response: any) => {}
      );
    }, 10);
  };

  const getHistory = (timetoken: number) => {
    pubnub.history({ channel: channel, reverse: true, count: 1000 }, (status, res) => {
      const newmessage: MessagesObjectProps[] = [];
      const end: any = res.endTimeToken ? res.endTimeToken : 1;
      res.messages.forEach((element, index) => {
        newmessage[index] = element.entry;
      });

      if (messages.length !== newmessage.length) {
        if (newmessage[newmessage.length - 1].message === autoMessageStrings.startConsult) {
          props.setJrDoctorJoined(false);
          // updateSessionAPI();
          // checkingAppointmentDates();
        }

        if (newmessage[newmessage.length - 1].message === autoMessageStrings.startConsultjr) {
          props.setJrDoctorJoined(true);
          // updateSessionAPI();
          // checkingAppointmentDates();
        }

        insertText = newmessage;
        setMessages(newmessage as []);
        if (res.messages.length == 100) {
          getHistory(end);
        }

        checkAutomatedPatientText();
      } else {
        checkAutomatedPatientText();
      }
    });
  };
  const [videoCall, setVideoCall] = useState(false);
  const [audiocallmsg, setAudiocallmsg] = useState(false);
  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
    });
    getHistory(0);
    pubnub.addListener({
      status: (statusEvent) => {},
      message: (message) => {
        setRing(
          message.message.message === autoMessageStrings.videoCallMsg ||
            message.message.message === autoMessageStrings.audioCallMsg
        );
        if (
          message.message.message === autoMessageStrings.videoCallMsg ||
          message.message.message === autoMessageStrings.audioCallMsg
        ) {
          setCallAudio(message.message.message);
        }
        setAudiocallmsg(message.message.message.includes('callme`audio'));
        setVideoCall(message.message.message.includes('audio'));

        insertText[insertText.length] = message.message;
        setMessages(() => [...insertText]);
        resetMessagesAction();
        srollToBottomAction();
        if (
          !showVideoChat &&
          message.message.message !== autoMessageStrings.videoCallMsg &&
          message.message.message !== autoMessageStrings.audioCallMsg &&
          message.message.message !== autoMessageStrings.stopcallMsg &&
          message.message.message !== autoMessageStrings.acceptedcallMsg &&
          message.message.message !== autoMessageStrings.startConsult &&
          message.message.message !== autoMessageStrings.stopConsult &&
          message.message.message !== autoMessageStrings.rescheduleconsult
        ) {
          setIsNewMsg(true);
        }
        if (message.message.message === autoMessageStrings.startConsult) {
          setStartConsult(true);
          props.hasDoctorJoined(true);
        }

        if (message.message.message === autoMessageStrings.stopConsult) {
          props.hasDoctorJoined(false);
        }

        if (message.message.message === autoMessageStrings.startConsultjr) {
          setStartConsult(true);
          props.setJrDoctorJoined(true);
        }
        if (message.message.message === autoMessageStrings.stopConsultjr) {
          props.setJrDoctorJoined(false);
        }

        if (
          message.message &&
          (message.message.message === autoMessageStrings.videoCallMsg ||
            message.message.message === autoMessageStrings.audioCallMsg)
        ) {
          setIsCalled(true);
          setShowVideo(false);
          setIsVideoCall(
            message.message.message === autoMessageStrings.videoCallMsg ? true : false
          );
        }
        if (message.message && message.message.message === autoMessageStrings.stopcallMsg) {
          setIsCalled(false);
          setShowVideo(false);
        }
      },
      presence: (presenceEvent) => {},
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, []);

  const chatTimeConvertion = (timeStamp: string) => {
    const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
      moment(timeStamp).format('YYYY-MM-DD')
    );
    if (dateValidate === 0) {
      return moment
        .utc(timeStamp)
        .local()
        .format('h:mm A');
    } else {
      return moment
        .utc(timeStamp)
        .local()
        .format('DD MMM, YYYY h:mm A');
    }
    return '--';
  };

  // End of Explaining the steps to patient with message.

  // Start of first Text to patient if junior doctor doesn't attent the consult

  let thirtySecondTimer: any = null;

  const stopTimerForFirstTextMessageToPatient = () => {
    thirtySecondTimer && clearTimeout(thirtySecondTimer);
  };

  const startTimerForFirstTextMessageToPatient = () => {
    thirtySecondTimer = setTimeout(function() {
      if (props.jrDoctorJoined == false) {
        const result = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.firstMessage;
        });
        const startConsultResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsult;
        });
        const startConsultjrResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsultjr;
        });

        if (
          result.length === 0 &&
          startConsultResult.length === 0 &&
          startConsultjrResult.length === 0
        ) {
          pubnub.publish(
            {
              channel: channel,
              message: {
                message: autoMessageStrings.firstMessage,
                automatedText: `Hi ${currentPatient &&
                  currentPatient.firstName}, sorry to keep you waiting.
      ${displayName}
’s team is with another patient right now.Your consultation prep will start soon.`,
                id: doctorId,
                isTyping: true,
                messageDate: new Date(),
              },
              storeInHistory: true,
              sendByPost: true,
            },
            (status, response) => {}
          );
        } else {
          thirtySecondTimer && clearTimeout(thirtySecondTimer);
        }
      } else {
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
      }
    }, 30000);
  };

  useEffect(() => {
    startTimerForFirstTextMessageToPatient();
    return () => {
      stopTimerForFirstTextMessageToPatient();
    };
  }, []);

  // End of first Text to patient if junior doctor doesn't attent the consult

  // Start of Second Text to patient if junior doctor doesn't attent the consult
  let minuteTimer: any = null;

  const stopTimerForSecondTextMessageToPatent = () => {
    minuteTimer && clearTimeout(minuteTimer);
  };

  const sendMsg = (msgObject: any, isStoreInHistory: boolean) => {
    pubnub.publish(
      {
        channel: channel,
        message: msgObject,
        storeInHistory: isStoreInHistory,
        sendByPost: true,
      },
      (status: any, response: any) => {
        setMessageText('');
        srollToBottomAction();
      }
    );
  };
  const uploadfile = (url: string) => {
    apolloClient
      .mutate<AddChatDocument, AddChatDocumentVariables>({
        mutation: ADD_CHAT_DOCUMENT,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: props.appointmentId, documentPath: url },
      })
      .then((_data) => {
        if (_data && _data.data && _data.data.addChatDocument) {
          setDocumentArray(_data.data.addChatDocument as any);
        }
      })
      .catch((error: ApolloError) => {
        console.log(error);
      });
  };

  const startTimerForSecondTextMessageToPatient = () => {
    minuteTimer = setTimeout(function() {
      if (props.jrDoctorJoined == false) {
        const result = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.secondMessage;
        });

        const startConsultResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsult;
        });

        const startConsultjrResult = insertText.filter((obj: any) => {
          return obj.message === autoMessageStrings.startConsultjr;
        });

        if (
          result.length === 0 &&
          startConsultResult.length === 0 &&
          startConsultjrResult.length === 0
        ) {
          pubnub.publish(
            {
              channel: channel,
              message: {
                message: autoMessageStrings.secondMessage,
                automatedText: `Sorry, but all the members in  ${displayName}’s team are busy right now.We will send you a notification as soon as they are available for collecting your details`,
                id: doctorId,
                isTyping: true,
                messageDate: new Date(),
              },
              storeInHistory: true,
              sendByPost: true,
            },
            (status, response) => {}
          );
        } else {
          minuteTimer && clearTimeout(minuteTimer);
        }
      } else {
        minuteTimer && clearTimeout(minuteTimer);
      }
    }, 90000);
  };

  useEffect(() => {
    startTimerForSecondTextMessageToPatient();
    return () => {
      stopTimerForSecondTextMessageToPatent();
    };
  }, []);

  //  End of Second Text to patient if junior doctor doesn't attent the consult

  const startIntervalTimer = (timer: number) => {
    setstartTimerAppoinmentt(true);
    timerIntervalId = setInterval(() => {
      timer = timer + 1;
      stoppedConsulTimer = timer;
      setStartingTime(timer);
    }, 1000);
  };

  const stopIntervalTimer = () => {
    setStartingTime(0);
    timerIntervalId && clearInterval(timerIntervalId);
  };

  const srollToBottomAction = () => {
    setTimeout(() => {
      const scrollDiv = document.getElementById('scrollDiv');
      if (scrollDiv) {
        scrollDiv!.scrollIntoView();
      }
    }, 200);
  };

  const resetMessagesAction = () => {
    if (messageText === '' || messageText === ' ') {
      setMsg('reset');
      setMsg('');
    }
  };

  const send = () => {
    try {
      const text = {
        id: patientId,
        message: messageText,
        messageDate: new Date(),
      };
      setMessageText('');
      pubnub.publish(
        {
          channel: channel,
          message: text,
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {
          // resetMessagesAction();
          // srollToBottomAction();
        }
      );
    } catch (e) {
      alert(e);
    }
  };

  const showPrescriptionCard = (rowData: MessagesObjectProps) => (
    <div className={`${classes.blueBubble} ${classes.petient} `}>
      {`Hello ${currentPatient &&
        currentPatient.firstName}, \nHope your consultation went well… Here is your prescription.`}
      <div className={classes.bubbleActions}>
        <AphButton className={classes.viewButton}>Download</AphButton>
        <AphButton className={classes.viewButton}>View</AphButton>
      </div>
      <div className={classes.chatTime}>{chatTimeConvertion(rowData.messageDate)}</div>
    </div>
  );
  const docNotAvailable = (rowData: MessagesObjectProps) => (
    <div className={`${classes.blueBubble} ${classes.petient} `}>
      {rowData.message === autoMessageStrings.rescheduleconsult
        ? "We're sorry that doctor is not available and you have to reschedule this appointment, however you can reschedule it for free."
        : ''}
      <div className={classes.chatTime}>{chatTimeConvertion(rowData.messageDate)}</div>
    </div>
  );

  const getFollowupOrRescheduleCard = (rowData: MessagesObjectProps) => (
    <div className={`${classes.doctorChatBubble} ${classes.blueBubble} ${classes.petient} `}>
      {(rowData.message === autoMessageStrings.followupconsult &&
        rowData.transferInfo.folloupDateTime.length) > 0 ? (
        <div>
          <div>I've a free followup for you --</div>
          <div>{rowData.transferInfo.folloupDateTime}</div>
        </div>
      ) : (
        <div>
          <div className={`${classes.dashedBorderBottom} ${classes.scheduledText} `}>
            I've rescheduled your appointment --
          </div>
          <div className={`${classes.dashedBorderBottom} ${classes.scheduledTextTwo} `}>
            {moment(rowData.transferInfo.transferDateTime).format('Do MMMM, dddd \nhh:mm a')}
          </div>
        </div>
      )}
      <div className={classes.bubbleActions}>
        <AphButton
          className={classes.viewButton}
          onClick={() => {
            nextAvailableSlot(params.doctorId, new Date());
          }}
        >
          Reschedule
        </AphButton>
      </div>
      <div className={classes.chatTime}>{chatTimeConvertion(rowData.messageDate)}</div>
    </div>
  );

  const getNextAvailableRescheduleSlot = (rowData: MessagesObjectProps) => (
    <div className={classes.petient}>
      {/* <div>
        {rowData.message === autoMessageStrings.rescheduleconsult &&
          rowData.transferInfo.rescheduleCount < 4
          ? 'We’re sorry that you have to reschedule. You can reschedule up to 3 times for free.'
          : `Since you have already rescheduled 3 times with ${ rowData.transferInfo.doctorInfo.displayName }, we will consider this a new paid appointment.`}
      </div> */}
      <div>{`Next slot for Dr.${rowData.transferInfo.doctorInfo.displayName} Apollo is available on —`}</div>
      <div>{moment(rowData.transferInfo.transferDateTime).format('Do MMMM, dddd \nhh:mm a')}</div>
      <div className={classes.bubbleActions}>
        <AphButton
          className={classes.viewButton}
          onClick={() => {
            nextAvailableSlot(params.doctorId, new Date());
            const bookRescheduleInput = {
              appointmentId: params.appointmentId,
              doctorId: params.doctorId,
              newDateTimeslot: nextSlotAvailable,
              initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
              initiatedId: patientId,
              patientId: patientId,
              rescheduledId: '',
            };
            rescheduleAPI(bookRescheduleInput);
          }}
        >
          ACCEPT
        </AphButton>
        <AphButton className={classes.viewButton} onClick={() => setIsModalOpen(true)}>
          CHANGE SLOT
        </AphButton>
      </div>
      <div className={classes.chatTime}>{chatTimeConvertion(rowData.messageDate)}</div>
    </div>
  );

  const renderChatRow = (rowData: MessagesObjectProps, index: number) => {
    if (
      rowData.message === autoMessageStrings.typingMsg ||
      rowData.message === autoMessageStrings.stopcallMsg ||
      rowData.message === autoMessageStrings.audioCallMsg ||
      rowData.message === autoMessageStrings.videoCallMsg ||
      rowData.message === autoMessageStrings.acceptedcallMsg ||
      rowData.message === autoMessageStrings.stopConsult
    ) {
      return null;
    }
    if (
      rowData.id === patientId &&
      rowData.message !== autoMessageStrings.videoCallMsg &&
      rowData.message !== autoMessageStrings.audioCallMsg &&
      rowData.message !== autoMessageStrings.stopcallMsg &&
      rowData.message !== autoMessageStrings.stopConsult &&
      rowData.message !== autoMessageStrings.acceptedcallMsg &&
      rowData.message !== autoMessageStrings.rescheduleconsult &&
      rowData.message !== autoMessageStrings.followupconsult &&
      rowData.message !== autoMessageStrings.consultPatientStartedMsg &&
      rowData.message !== autoMessageStrings.firstMessage &&
      rowData.message !== autoMessageStrings.secondMessage &&
      rowData.message !== autoMessageStrings.covertVideoMsg &&
      rowData.message !== autoMessageStrings.covertAudioMsg &&
      rowData.message !== autoMessageStrings.cancelConsultInitiated &&
      rowData.message !== autoMessageStrings.callAbandonment &&
      rowData.message !== autoMessageStrings.appointmentComplete
    ) {
      leftComponent++;
      rightComponent = 0;
      return (
        <div className={classes.patientChat}>
          <div className={rowData.duration ? classes.callMsg : classes.chatBub}>
            {leftComponent == 1 && <span className={classes.boldTxt}></span>}
            {rowData.duration === '00 : 00' ? (
              <span className={classes.none}>
                <img src={require('images/ic_missedcall.svg')} />
                {rowData.message === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call'}
              </span>
            ) : rowData.duration ? (
              <div className={classes.callEnded}>
                <span>
                  <img src={require('images/ic_round_call.svg')} />
                </span>
                <div>
                  {rowData.message}
                  <span className={classes.durationMsg}>Duration- {rowData.duration}</span>
                  {rowData.messageDate && (
                    <div className={`${classes.chatTime} ${classes.defaultChatTime} `}>
                      {chatTimeConvertion(rowData.messageDate)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={
                  rowData.message === autoMessageStrings.documentUpload
                    ? classes.chatImgBubble
                    : classes.chatBubble
                }
              >
                {leftComponent == 1 && !rowData.duration && (
                  <div className={classes.patientAvatar}>
                    <Avatar
                      className={classes.avatar}
                      src={
                        doctorDetails && doctorDetails.getDoctorDetailsById
                          ? doctorDetails.getDoctorDetailsById.photoUrl
                          : require('images/no_photo_icon_round.svg')
                      }
                      alt=""
                    />
                  </div>
                )}
                {rowData.message === autoMessageStrings.documentUpload ? (
                  <div
                    onClick={() => {
                      setModalOpen(true);
                      setImgPrevUrl(rowData.url);
                    }}
                    className={classes.imageUpload}
                  >
                    <img src={rowData.url} alt={rowData.url} />
                    {rowData.messageDate && (
                      <div className={classes.timeStampImg}>
                        {chatTimeConvertion(rowData.messageDate)}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <span>{rowData.message}</span>
                      <div className={`${classes.chatTime} ${classes.defaultChatTime} `}>
                        {chatTimeConvertion(rowData.messageDate)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    } else if (
      rowData.message !== autoMessageStrings.videoCallMsg &&
      rowData.message !== autoMessageStrings.audioCallMsg &&
      rowData.message !== autoMessageStrings.stopcallMsg &&
      rowData.message !== autoMessageStrings.acceptedcallMsg &&
      rowData.message !== autoMessageStrings.covertVideoMsg &&
      rowData.message !== autoMessageStrings.covertAudioMsg &&
      rowData.message !== autoMessageStrings.cancelConsultInitiated &&
      rowData.message !== autoMessageStrings.callAbandonment &&
      rowData.message !== autoMessageStrings.appointmentComplete
    ) {
      leftComponent = 0;
      rightComponent++;
      return (
        <div className={classes.doctorsChat}>
          <div className={rowData.duration ? classes.callMsg : classes.chatBub}>
            {leftComponent == 1 && <span className={classes.boldTxt}></span>}
            {rowData.duration === '00 : 00' ? (
              <>
                <span className={classes.none}>
                  <img src={require('images/ic_missedcall.svg')} />
                  {rowData.message === 'Video call ended'
                    ? 'You missed a video call'
                    : 'You missed a voice call'}
                </span>
                {rowData.messageDate && (
                  <div className={classes.timeStamp}>{chatTimeConvertion(rowData.messageDate)}</div>
                )}
              </>
            ) : rowData.duration ? (
              <div>
                <img src={require('images/ic_round_call.svg')} />
                <span>{rowData.message}</span>
                <span className={classes.durationMsg}>Duration- {rowData.duration}</span>
                {rowData.messageDate && (
                  <div className={classes.timeStamp}>{chatTimeConvertion(rowData.messageDate)}</div>
                )}
              </div>
            ) : (
              <div
                className={
                  rowData.message === autoMessageStrings.documentUpload ? classes.chatImgBubble : ''
                }
              >
                <div className={classes.doctorAvatar}>
                  <Avatar
                    className={classes.avatar}
                    src={
                      doctorDetails && doctorDetails.getDoctorDetailsById
                        ? doctorDetails.getDoctorDetailsById.photoUrl
                        : require('images/no_photo_icon_round.svg')
                    }
                    alt=""
                  />
                </div>
                {rowData.message === autoMessageStrings.documentUpload ? (
                  <div
                    onClick={() => {
                      setModalOpen(true);
                      setImgPrevUrl(rowData.url);
                    }}
                    className={classes.imageUpload}
                  >
                    <img src={rowData.url} alt={rowData.url} />
                    {rowData.messageDate && (
                      <div className={classes.timeStampImg}>
                        {chatTimeConvertion(rowData.messageDate)}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className={rowData.automatedText ? classes.petient : classes.chatBubbledoc}
                    >
                      {/* show Prescription card */}
                      {rowData.message === autoMessageStrings.stopConsult ||
                        (rowData.message === autoMessageStrings.followupconsult &&
                          showPrescriptionCard(rowData))}

                      {/* show reschedule or followup card */}

                      {/* {(rowData.message === autoMessageStrings.rescheduleconsult ||
                            rowData.message === autoMessageStrings.followupconsult) &&
                            getFollowupOrRescheduleCard(rowData)} */}

                      {/* show available slots for reschedule */}
                      {rowData.message === autoMessageStrings.rescheduleconsult
                        ? docNotAvailable(rowData)
                        : null}

                      {/* show available slots for reschedule */}
                      {rowData.message === autoMessageStrings.rescheduleconsult
                        ? getNextAvailableRescheduleSlot(rowData)
                        : null}
                      {/* show other messages when it is not reschedule and followUp   */}
                      {rowData.message !== autoMessageStrings.rescheduleconsult &&
                      rowData.message !== autoMessageStrings.followupconsult ? (
                        <div>
                          <span>{rowData.automatedText || rowData.message}</span>
                          <div
                            className={
                              rowData.automatedText
                                ? classes.chatTime
                                : `${classes.chatTime} ${classes.defaultChatTime} `
                            }
                          >
                            {chatTimeConvertion(rowData.messageDate)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  };
  const messagessHtml =
    messages && messages.length > 0
      ? messages.map((item: MessagesObjectProps, index: number) => {
          return <div key={index.toString()}>{renderChatRow(item, index)}</div>;
        })
      : '';
  return (
    <div className={classes.consultRoom}>
      <button onClick={toggle} id="soundButton" style={{ display: 'none' }}>
        {playing ? 'Pause' : 'Play'}
      </button>
      <div
        className={`${classes.chatSection} ${
          !showVideo ? classes.chatWindowContainer : classes.audioVideoContainer
        } `}
      >
        {showVideo && sessionId !== '' && token !== '' && (
          <ChatVideo
            stopAudioVideoCall={() => stopAudioVideoCall()}
            toggelChatVideo={() => toggelChatVideo()}
            stopConsultCall={() => stopConsultCall()}
            sessionId={sessionId}
            token={token}
            showVideoChat={showVideoChat}
            isVideoCall={isVideoCall}
            isNewMsg={isNewMsg}
            timerMinuts={timerMinuts}
            timerSeconds={timerSeconds}
            doctorDetails={doctorDetails}
            convertCall={() => convertCall()}
            videoCall={videoCall}
            audiocallmsg={audiocallmsg}
          />
        )}
        <div>
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatContainer}>
              <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 352px)'}>
                {messagessHtml}
                <span id="scrollDiv"></span>
              </Scrollbars>
            </div>
          )}
          {(!showVideo || showVideoChat) && (
            <div className={classes.chatWindowFooter}>
              <AphTextField
                autoFocus
                className={classes.searchInput}
                inputProps={{ type: 'text' }}
                placeholder="Type here..."
                value={messageText}
                onKeyPress={(e) => {
                  if ((e.which == 13 || e.keyCode == 13) && messageText.trim() !== '') {
                    send();
                  }
                }}
                onChange={(event) => {
                  setMessageText(event.currentTarget.value);
                }}
              />
              <AphButton className={classes.chatSubmitBtn}>
                <img src={require('images/ic_add_circle.svg')} alt="" />
              </AphButton>
            </div>
          )}
        </div>
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <DialogTitle>File Upload Error</DialogTitle>
          <DialogContent>
            <DialogContentText>{fileUploadErrorMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                setIsDialogOpen(false);
                setFileUploading(false);
              }}
              autoFocus
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className={classes.modalWindowWrap}>
            <div className={classes.tableContent}>
              <div className={classes.modalWindow}>
                <div className={classes.modalHeader}>
                  <div className={classes.modalClose} onClick={() => setModalOpen(false)}>
                    <img src={require('images/ic_round_clear.svg')} alt="" />
                  </div>
                </div>
                <div className={classes.modalContent}>
                  <img src={imgPrevUrl} alt="" />
                </div>
                <div className={classes.modalFooter}></div>
              </div>
            </div>
          </div>
        </Modal>
        {doctorDetails && (
          <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            disableBackdropClick
            disableEscapeKeyDown
          >
            <Paper className={classes.modalBox}>
              <div className={classes.modalBoxClose} onClick={() => setIsModalOpen(false)}>
                <img src={require('images/ic_cross_popup.svg')} alt="" />
              </div>
              <OnlineConsult
                setIsPopoverOpen={setIsModalOpen}
                doctorDetails={doctorDetails}
                onBookConsult={(popover: boolean) => setIsModalOpen(popover)}
                isRescheduleConsult={true}
                appointmentId={params.appointmentId}
                rescheduleAPI={rescheduleAPI}
              />
            </Paper>
          </Modal>
        )}
        {!showVideo && (
          <div>
            {isCalled && (
              <div className={classes.incomingCallContainer}>
                <div className={classes.incomingCallWindow}>
                  <img
                    src={
                      profileImage !== null
                        ? profileImage
                        : require('images/doctor_profile_image.png')
                    }
                  />
                  <div className={classes.callOverlay}>
                    <div className={classes.topText}>Ringing</div>
                    <div className={classes.callActions}>
                      <Button className={classes.callPickIcon} onClick={() => actionBtn()}>
                        <img src={require('images/ic_callpick.svg')} alt="" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
  // useEffect(() => {
  //   if (isStartConsult) {
  //     mutationResponse()
  //       .then((data) => {
  //         const appointmentToken =
  //           data && data.data && data.data.updateAppointmentSession
  //             ? data.data.updateAppointmentSession.appointmentToken
  //             : '';
  //         const sessionId =
  //           data && data.data && data.data.updateAppointmentSession.sessionId
  //             ? data.data.updateAppointmentSession.sessionId
  //             : '';
  //         setsessionId(sessionId);
  //         console.log('sessionid', sessionId);
  //         settoken(appointmentToken);
  //       })
  //       .catch(() => {
  //         window.alert('An error occurred while loading :(');
  //       });
  //   }
  // }, [isStartConsult]);
};
