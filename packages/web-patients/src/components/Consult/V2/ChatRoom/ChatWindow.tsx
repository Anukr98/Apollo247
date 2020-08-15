import React, { useEffect, useState, useRef, useContext } from 'react';
import { Theme, Grid, Button, Avatar, Modal, Popover, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import {
  AphButton,
  AphTextField,
  AphSelect,
  AphDialog,
  AphDialogClose,
  AphDialogTitle,
} from '@aph/web-ui-components';
import Slider from 'react-slick';
import { ChatVideo } from 'components/Consult/V2/ChatRoom/ChatVideo';
import WarningModel from 'components/WarningModel';
import { PatientCard } from 'components/Consult/V2/ChatRoom/PatientCard';
import { DoctorCard } from 'components/Consult/V2/ChatRoom/DoctorCard';
import { WelcomeCard } from 'components/Consult/V2/ChatRoom/WelcomeCard';
import { BookRescheduleAppointmentInput } from 'graphql/types/globalTypes';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import FormHelperText from '@material-ui/core/FormHelperText';
import PubNub, { PubnubStatus, PublishResponse, HistoryResponse } from 'pubnub';
import _startCase from 'lodash/startCase';
import { useMutation } from 'react-apollo-hooks';
import {
  JOIN_JDQ_WITH_AUTOMATED_QUESTIONS,
  GET_APPOINTMENT_DATA,
  UPDATE_APPOINTMENT_SESSION,
} from 'graphql/consult';
import {
  AddToConsultQueueWithAutomatedQuestions,
  AddToConsultQueueWithAutomatedQuestionsVariables,
} from 'graphql/types/AddToConsultQueueWithAutomatedQuestions';
import {
  UpdateAppointmentSession,
  UpdateAppointmentSessionVariables,
} from 'graphql/types/UpdateAppointmentSession';
import { GetAppointmentData, GetAppointmentDataVariables } from 'graphql/types/GetAppointmentData';
import { useApolloClient } from 'react-apollo-hooks';
import { UploadChatPrescription } from 'components/ChatRoom/V2/UploadChatPrescriptions';
import { UploadChatEPrescriptionCard } from 'components/ChatRoom/V2/UploadChatEPrescriptionCard';

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
      '&:disabled': {
        opacity: 0.5,
        pointerEvents: 'none',
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
      bottom: 8,
      left: 0,
      minWidth: 'auto',
      padding: 0,
      boxShadow: 'none',
      textAlign: 'center',
      '& span': {
        color: '#01475B',
        fontWeight: '500',
        fontSize: 7,
        lineHeight: '9px',
        display: 'block',
      },
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    chatSend: {
      position: 'absolute',
      right: -10,
      top: 3,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&:disabled': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
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
    chatWindowFooterInput: {
      '& input': {
        marginLeft: '75px',
        marginBottom: 15,
        borderLeft: '1px solid #00B38E',
        padding: '0px 0 0px 10px !important',
      },
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
      zIndex: 9999,
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
    quesContainer: {
      position: 'relative',
      bottom: 0,
      padding: 30,
      background: '#fff',
      margin: '20px 15px 0 15px',
      width: 'calc(100% - 30px)',
      borderRadius: 5,
      '& label': {
        display: 'inline-block',
        width: '100%',
        color: '#02475B',
        fontWeight: 500,
        fontSize: 15,
        [theme.breakpoints.down('xs')]: {
          fontSize: 12,
        },
      },
      [theme.breakpoints.down('xs')]: {
        height: 180,
      },
    },
    slider: {
      '& >.slick-dots': {
        position: 'static !important',
        [theme.breakpoints.down('xs')]: {
          position: 'absolute !important',
          bottom: 50,
        },
        pointerEvents: 'none',
        '& li': {
          margin: 0,
          '& button': {
            '&:before': {
              content: '.',
              fontSize: 10,
              color: 'rgba(0,135,186,0.4)',
            },
          },
          '&.slick-active': {
            '& button': {
              '&:before': {
                color: 'rgba(0,135,186,1)',
              },
            },
          },
        },
      },
    },
    quesButton: {
      background: '#FFFFFF',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      color: '#00B38E',
      margin: '20px 30px 10px 2px',
      minWidth: 70,
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '21px',
      textTransform: 'capitalize',
      [theme.breakpoints.down('xs')]: {
        margin: '20px 10px 10px 2px',
      },
      '&:hover': {
        background: '#FFFFFF',
      },
    },
    quesSubmitBtn: {
      marginTop: 40,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      '&:focus': {
        outline: 'none',
      },
      '&:disabled': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    subComponent: {
      paddingTop: 6,
    },
    selectMenu: {
      minWidth: 120,
    },
    bpLabel: {
      padding: '5px 0 0 10px',
    },
    chatContainerSection: {
      autoHeightMax: 'calc(100vh - 352px)',
      maxHeight: 'calc(100vh - 352px) !important',
      '& div': {
        '&:first-child': {
          maxHeight: 'calc(100vh - 310px) !important',
        },
      },
      [theme.breakpoints.down('xs')]: {
        autoHeightMax: 'calc(100vh - 90px)',
        maxHeight: 'calc(100vh - 90px)',
        minHeight: 'calc(100vh - 90px)',
      },
    },
    chatContainerSectionques: {
      autoHeightMax: 'calc(100vh - 452px)',
      [theme.breakpoints.down('xs')]: {
        autoHeightMax: 'calc(100vh - 90px)',
        maxHeight: 'calc(100vh - 90px)',
        minHeight: 'calc(100vh - 90px)',
      },
    },
    doctorCardMain: {
      paddingLeft: 15,
    },
    patientCardMain: {
      textAlign: 'right',
    },
    ringtone: {
      position: 'absolute',
      zIndex: -1,
      height: 1,
      width: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0,0,0,0)',
      border: 0,
    },
    ePrescriptionTitle: {
      zIndex: 9999,
    },
  };
});

interface AutoMessageStrings {
  videoCallMsg: string;
  audioCallMsg: string;
  acceptedCallMsg: string;
  endCallMsg: string;
  startConsultMsg: string;
  stopConsultMsg: string;
  typingMsg: string;
  covertVideoMsg: string;
  covertAudioMsg: string;
  transferConsultMsg: string;
  rescheduleConsultMsg: string;
  followupconsult: string;
  imageconsult: string;
  startConsultjr: string;
  consultPatientStartedMsg: string;
  firstMessage: string;
  secondMessage: string;
  languageQue: string;
  jdThankyou: string;
  cancelConsultInitiated: string;
  stopConsultJr: string;
  callAbandonment: string;
  appointmentComplete: string;
  doctorAutoResponse: string;
  leaveChatRoom: string;
  patientJoinedMeetingRoom: string;
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

interface MessagesObjectProps {
  id: string;
  message: string;
  automatedText: string;
  duration: string;
  url: string;
  transferInfo: any;
  messageDate: string;
  cardType: string;
  // username: string;
  // text: string;
}
let timerIntervalId: any;
let stoppedConsulTimer: number;
const ringtoneUrl = require('images/phone_ringing.mp3');
const autoMessageStrings: AutoMessageStrings = {
  videoCallMsg: '^^callme`video^^',
  audioCallMsg: '^^callme`audio^^',
  acceptedCallMsg: '^^callme`accept^^',
  endCallMsg: '^^callme`stop^^',
  startConsultMsg: '^^#startconsult',
  stopConsultMsg: '^^#stopconsult',
  typingMsg: '^^#typing',
  covertVideoMsg: '^^convert`video^^',
  covertAudioMsg: '^^convert`audio^^',
  transferConsultMsg: '^^#transferconsult',
  rescheduleConsultMsg: '^^#rescheduleconsult',
  followupconsult: '^^#followupconsult',
  imageconsult: '^^#DocumentUpload',
  startConsultjr: '^^#startconsultJr',
  consultPatientStartedMsg: '^^#PatientConsultStarted',
  firstMessage: '^^#firstMessage',
  secondMessage: '^^#secondMessage',
  languageQue: '^^#languageQue',
  jdThankyou: '^^#jdThankyou',
  cancelConsultInitiated: '^^#cancelConsultInitiated',
  stopConsultJr: '^^#stopconsultJr',
  callAbandonment: '^^#callAbandonment',
  appointmentComplete: '^^#appointmentComplete',
  doctorAutoResponse: '^^#doctorAutoResponse',
  leaveChatRoom: '^^#leaveChatRoom',
  patientJoinedMeetingRoom: '^^#patientJoinedMeetingRoom',
};

export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const classes = useStyles({});
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [dietAllergy, setDietAllergy] = useState<string>('');
  const [drugAllergy, setDrugAllergy] = useState<string>('');
  const [smokeHabit, setSmokeHabit] = useState<string>('');
  const [drinkHabit, setDrinkHabit] = useState<string>('');
  const [smokes, setSmokes] = useState<string>('');
  const [drinkPerWeek, setDrinkPerWeek] = useState<string>('');
  const [dietAllergies, setDietAllergies] = useState<string>('');
  const [drugAllergies, setDrugAllergies] = useState<string>('');
  const [heightIn, setHeightIn] = useState<string>('ft');
  const [weightError, setWeightError] = useState<boolean>(false);
  const [heightError, setHeightError] = useState<boolean>(false);
  const [messages, setMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState<any>('');
  const [drugAllergyError, setDrugAllergyError] = useState<boolean>(false);
  const [dietAllergyError, setDietAllergyError] = useState<boolean>(false);
  const [bpError, setBpError] = useState<boolean>(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [autoQuestionsCompleted, setAutoQuestionsCompleted] = useState(false);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [appDataLoading, setAppDataLoading] = useState<boolean>(true);
  const [consultQMutationLoading, setConsultQMutationLoading] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const doctorDisplayName = props.doctorDetails.getDoctorDetailsById.displayName;
  const appointmentId = props.appointmentId;
  const scrollDivRef = useRef(null);
  const apolloClient = useApolloClient();

  //AV states
  const [playRingtone, setPlayRingtone] = useState<boolean>(false);
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [callAudio, setCallAudio] = useState(autoMessageStrings.audioCallMsg);
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  const [videoCall, setVideoCall] = useState(false);
  const [audiocallmsg, setAudiocallmsg] = useState(false);
  //OT Error state
  const [sessionError, setSessionError] = React.useState<boolean>(null);
  const [publisherError, setPublisherError] = React.useState<boolean>(null);
  const [subscriberError, setSubscriberError] = React.useState<boolean>(null);

  const [startTimerAppoinmentt, setstartTimerAppoinmentt] = React.useState<boolean>(false);
  const [startingTime, setStartingTime] = useState<number>(0);

  const timerMinuts = Math.floor(startingTime / 60);
  const timerSeconds = startingTime - timerMinuts * 60;
  const timerLastMinuts = Math.floor(startingTime / 60);
  const timerLastSeconds = startingTime - timerMinuts * 60;

  const mutationAddToConsultQ = useMutation<
    AddToConsultQueueWithAutomatedQuestions,
    AddToConsultQueueWithAutomatedQuestionsVariables
  >(JOIN_JDQ_WITH_AUTOMATED_QUESTIONS);

  const pubnubClient = new PubNub({
    publishKey: process.env.PUBLISH_KEY,
    subscribeKey: process.env.SUBSCRIBE_KEY,
    uuid: currentPatient && currentPatient.id,
    ssl: false,
  });

  const scrollToBottomAction = () => {
    setTimeout(() => {
      const scrollDiv = scrollDivRef.current;
      scrollDiv.scrollIntoView();
    }, 200);
  };

  //console.log('pubnub messages.......', messages);
  // console.log(appointmentDetails, 'appointment details.......');
  // console.log(autoQuestionsCompleted, 'auto question status.....................');

  // subscribe for any udpates
  useEffect(() => {
    const getAppointmentDetails = (appointmentId: string) => {
      apolloClient
        .query<GetAppointmentData, GetAppointmentDataVariables>({
          query: GET_APPOINTMENT_DATA,
          variables: {
            appointmentId: appointmentId,
          },
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          if (
            response &&
            response.data.getAppointmentData.appointmentsHistory &&
            response.data.getAppointmentData.appointmentsHistory.length > 0
          ) {
            const isJdCompleted =
              response.data.getAppointmentData.appointmentsHistory[0].isJdQuestionsComplete;
            setAppointmentDetails(response.data.getAppointmentData.appointmentsHistory[0]);
            setAutoQuestionsCompleted(isJdCompleted);
            setAppDataLoading(false);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    };

    if (appointmentId.length > 0) {
      // get appointment details
      getAppointmentDetails(appointmentId);

      // subscribe to channel
      pubnubClient.subscribe({
        channels: [appointmentId],
        withPresence: true,
      });

      // adding listener
      pubnubClient.addListener({
        status: (status) => {
          console.log('status...............', status);
        },
        message: (message) => {
          console.log(message);
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
            setPlayRingtone(true);
          }
          if (message.message && message.message.message === autoMessageStrings.endCallMsg) {
            setIsCalled(false);
            setShowVideo(false);
            setPlayRingtone(false);
          }
          const messageObject = {
            timetoken: message.timetoken,
            entry: message.message,
          };
          setNewMessage(messageObject);
          scrollToBottomAction();
        },
      });

      // get latest 100 messages
      pubnubClient.history(
        { channel: appointmentId, count: 100, stringifiedTimeToken: true },
        (status: PubnubStatus, response: HistoryResponse) => {
          console.log(response.messages.length, 'messages length.......');
          if (response.messages.length === 0) sendWelcomeMessage();
          setMessages(response.messages);
          scrollToBottomAction();
        }
      );
      return function cleanup() {
        pubnubClient.unsubscribe({ channels: [appointmentId] });
      };
    }
  }, [appointmentId]);

  useEffect(() => {
    // console.log(newMessage, 'new message in useeffect is.......');
    if (Object.keys(newMessage).length > 0) {
      const exisitingMessages = messages;
      exisitingMessages.push(newMessage);
      setMessages([...exisitingMessages]);
    }
  }, [newMessage]);

  // publish a message to pubnub channel
  const publishMessage = (channelName: string, message: any) => {
    pubnubClient.publish(
      {
        channel: channelName,
        message: message,
        storeInHistory: true,
      },
      (status: PubnubStatus, response: PublishResponse) => {
        if (status.error) {
          console.log('message not published', status.error);
        } else {
          console.log('message published', response);
        }
      }
    );
  };
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

  const autoSend = () => {
    const composeMessage = {
      id: currentPatient && currentPatient.id,
      message: autoMessageStrings.endCallMsg,
      automatedText: '',
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds} `,
      url: '',
      transferInfo: '',
      messageDate: new Date(),
      cardType: 'patient',
    };
    publishMessage(appointmentId, composeMessage);
  };
  const toggelChatVideo = () => {
    setIsNewMsg(false);
    setShowVideoChat(!showVideoChat);
    //srollToBottomAction();
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
      const composeMessage = {
        id: currentPatient && currentPatient.id,
        message: convertVideo
          ? autoMessageStrings.covertVideoMsg
          : autoMessageStrings.covertAudioMsg,
        automatedText: '',
        duration: `${
          timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
        } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds} `,
        url: '',
        transferInfo: '',
        messageDate: new Date(),
        cardType: 'patient',
      };
      publishMessage(appointmentId, composeMessage);
    }, 10);
  };

  const stopAudioVideoCall = () => {
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const composeMessage = {
      id: currentPatient && currentPatient.id,
      message: `${isVideoCall ? 'Video' : 'Audio'} call ended`,
      automatedText: '',
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds} `,
      url: '',
      transferInfo: '',
      messageDate: new Date(),
      cardType: 'patient',
    };
    publishMessage(appointmentId, composeMessage);
    stopIntervalTimer();
    autoSend();
    setShowVideo(false);
    setIsVideoCall(false);
    setIsCalled(false);
  };
  const actionBtn = () => {
    const composeMessage = {
      id: currentPatient && currentPatient.id,
      message: autoMessageStrings.acceptedCallMsg,
      automatedText: '',
      duration: '',
      url: '',
      transferInfo: '',
      messageDate: new Date(),
      cardType: 'patient',
    };
    publishMessage(appointmentId, composeMessage);
    setPlayRingtone(false);
    updateAppointmentSessionCall();
    startIntervalTimer(0);
    setCookiesAcceptcall();
    //audio.pause();
    setShowVideo(true);
    //setPlaying(!playing);
  };

  const mutationResponse = useMutation<UpdateAppointmentSession, UpdateAppointmentSessionVariables>(
    UPDATE_APPOINTMENT_SESSION,
    {
      variables: {
        UpdateAppointmentSessionInput: {
          appointmentId: appointmentId,
          requestRole: 'PATIENT',
        },
      },
    }
  );
  const updateAppointmentSessionCall = () => {
    mutationResponse()
      .then((data) => {
        if (data && data.data && data.data.updateAppointmentSession) {
          settoken(data.data.updateAppointmentSession.appointmentToken);
        }
        if (data && data.data && data.data.updateAppointmentSession.sessionId) {
          setsessionId(data.data.updateAppointmentSession.sessionId);
        }
      })
      .catch(() => {
        // setIsAlertOpen(true);
        // setAlertMessage('An error occurred while loading :(');
      });
  };
  const setCookiesAcceptcall = () => {
    const cookieStr = `action=${
      callAudio === autoMessageStrings.videoCallMsg ? 'videocall' : 'audiocall'
    }`;
    document.cookie = cookieStr + ';path=/;';
  };

  const sliderSettings = {
    dots: true,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoPlaySpeed: 5000,
    autoplay: false,
    swipe: false,
    touchMove: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const sendWelcomeMessage = () => {
    const composeMessage = {
      id: currentPatient && currentPatient.id,
      message: 'welcome',
      automatedText: autoMessageStrings.consultPatientStartedMsg,
      duration: '',
      url: '',
      transferInfo: '',
      messageDate: new Date(),
      cardType: 'welcome',
    };
    publishMessage(appointmentId, composeMessage);
  };

  const sliderRef = useRef(null);
  const heightQuestionContent = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={6} sm={5} md={5} lg={5}>
            <label>What is your height?</label>
            <AphTextField
              autoFocus
              className={classes.searchInput}
              inputProps={{ type: 'text' }}
              placeholder="eg. 5’ 8”"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const height = e.target.value;
                setHeight(e.target.value);
                if (
                  (heightIn === 'cm' && height.match(/^[0-9]+\.{0,1}[0-9]{0,3}$/)) ||
                  (heightIn === 'ft' &&
                    height.match(/^[0-9]{1,2}('|’)(?:\s*(?:1[01]|[0-9])(''|"|’’|”))?$/))
                ) {
                  setHeightError(false);
                } else if (height.length >= 4) {
                  setHeightError(true);
                }
              }}
              value={height}
              error={heightError}
            />
          </Grid>
          <Grid item xs={4} sm={4} md={4} lg={4}>
            <label className={classes.subComponent}>&nbsp;</label>
            <AphSelect
              value={heightIn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeightIn(e.target.value)}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }}
            >
              <MenuItem key="ft" value="ft" className={classes.selectMenu}>
                ft
              </MenuItem>
              <MenuItem key="cm" value="cm">
                cm
              </MenuItem>
            </AphSelect>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={heightError}
              onClick={() => {
                if (
                  (heightIn === 'cm' && height.match(/^[0-9]+\.{0,1}[0-9]{0,3}$/)) ||
                  (heightIn === 'ft' &&
                    height.match(/^[0-9]{1,2}('|’)(?:\s*(?:1[01]|[0-9])(''|"|’’|”))?$/))
                ) {
                  showNextSlide();
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Height:\n${height} ${heightIn}`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                } else setHeightError(true);
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
        {heightError && (
          <FormHelperText component="div" error={true}>
            Enter height in valid format (eg. 5'8" ft or 172.5 cm)
          </FormHelperText>
        )}
      </div>
    );
  };

  const weightQuestionContent = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>What is your weight (in kg) ?</label>
            <AphTextField
              autoFocus
              className={classes.searchInput}
              inputProps={{ type: 'text' }}
              placeholder="Enter weight in kilogram…"
              value={weight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const weight = e.target.value;
                setWeight(e.target.value);
                if (weight.length > 0 && weight.match(/^[0-9]+\.{0,1}[0-9]{0,3}$/)) {
                  setWeightError(false);
                } else if (weight.length > 0) {
                  setWeightError(true);
                }
              }}
              error={weightError}
            />
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              onClick={() => {
                if (weight.match(/^[0-9]+\.{0,1}[0-9]{0,3}$/)) {
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Weight:\n${weight}`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                  showNextSlide();
                } else setWeightError(true);
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
        {weightError && (
          <FormHelperText component="div" error={true}>
            Enter weight in kilogram... (eg. 56)
          </FormHelperText>
        )}
      </div>
    );
  };

  const drugAlergyQuestionChoice = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>Are you allergic to any medicine?</label>
            <AphButton
              className={`${classes.quesButton}  ${drugAllergy === 'yes' ? classes.btnActive : ''}`}
              onClick={() => setDrugAllergy('yes')}
            >
              Yes
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${drugAllergy === 'no' ? classes.btnActive : ''}`}
              onClick={() => setDrugAllergy('no')}
            >
              No
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={drugAllergy.length === 0}
              onClick={() => {
                if (drugAllergy.length > 0) {
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Medicine Allergy:\n${_startCase(drugAllergy)}`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                  showNextSlide();
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
      </div>
    );
  };

  const foodAlergyQuestionChoice = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>Are you allergic to any kind of food?</label>
            <AphButton
              className={`${classes.quesButton}  ${dietAllergy === 'yes' ? classes.btnActive : ''}`}
              onClick={() => setDietAllergy('yes')}
            >
              Yes
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${dietAllergy === 'no' ? classes.btnActive : ''}`}
              onClick={() => setDietAllergy('no')}
            >
              No
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={dietAllergy.length === 0}
              onClick={() => {
                if (dietAllergy.length > 0) {
                  showNextSlide();
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Food Allergy:\n${_startCase(dietAllergy)}`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
      </div>
    );
  };

  const smokeQuestionChoice = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>Do you smoke?</label>
            <AphButton
              className={`${classes.quesButton}  ${smokeHabit === 'yes' ? classes.btnActive : ''}`}
              onClick={() => setSmokeHabit('yes')}
            >
              Yes
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${smokeHabit === 'no' ? classes.btnActive : ''}`}
              onClick={() => setSmokeHabit('no')}
            >
              No
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={smokeHabit.length === 0}
              onClick={() => {
                if (smokeHabit.length > 0) {
                  showNextSlide();
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Smoke:\n${_startCase(smokeHabit)}`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
      </div>
    );
  };

  const drinkQuestionChoice = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>Do you drink alcohol?</label>
            <AphButton
              className={`${classes.quesButton}  ${drinkHabit === 'yes' ? classes.btnActive : ''}`}
              onClick={() => setDrinkHabit('yes')}
            >
              Yes
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${drinkHabit === 'no' ? classes.btnActive : ''}`}
              onClick={() => setDrinkHabit('no')}
            >
              No
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={drinkHabit.length === 0}
              onClick={() => {
                if (drinkHabit.length > 0) {
                  showNextSlide();
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Drink:\n${_startCase(drinkHabit)}`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
      </div>
    );
  };

  const drugsInput = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>What medicines are you allergic to?</label>
            <AphTextField
              autoFocus
              className={classes.searchInput}
              inputProps={{ type: 'text' }}
              placeholder="Enter medicine names"
              value={drugAllergies}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const medicineNames = e.target.value;
                setDrugAllergies(e.target.value);
                if (medicineNames.length > 0) {
                  setDrugAllergyError(false);
                } else {
                  setDrugAllergyError(true);
                }
              }}
            />
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={drugAllergies.length === 0}
              onClick={() => {
                if (drugAllergies.length > 0) {
                  showNextSlide();
                } else {
                  setDrugAllergyError(true);
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
        {drugAllergyError && (
          <FormHelperText component="div" error={true}>
            Enter allergic medicine names
          </FormHelperText>
        )}
      </div>
    );
  };

  const foodAlergyInput = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>What kind of food are you allergic to?</label>
            <AphTextField
              autoFocus
              value={dietAllergies}
              className={classes.searchInput}
              inputProps={{ type: 'text' }}
              placeholder="Enter allergic foods"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDietAllergies(e.target.value)
              }
            />
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={dietAllergies.length === 0}
              onClick={() => {
                if (dietAllergies.length > 0) {
                  showNextSlide();
                } else {
                  setDietAllergyError(true);
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
        {dietAllergyError && (
          <FormHelperText component="div" error={true}>
            Enter allergic food items
          </FormHelperText>
        )}
      </div>
    );
  };

  const smokeInput = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>How many do you smoke per day ? </label>
            <AphButton
              className={`${classes.quesButton}  ${smokes === '10' ? classes.btnActive : ''}`}
              onClick={() => setSmokes('10')}
            >
              &gt; 10
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${smokes === '10-20' ? classes.btnActive : ''}`}
              onClick={() => setSmokes('10-20')}
            >
              10-20
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${smokes === '>20' ? classes.btnActive : ''}`}
              onClick={() => setSmokes('>20')}
            >
              &gt; 20
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={smokes.length === 0}
              onClick={() => {
                if (smokes.length > 0) showNextSlide();
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
      </div>
    );
  };

  const drinkInput = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>How much alcohol do you drink in a week? </label>
            <AphButton
              className={`${classes.quesButton}  ${
                drinkPerWeek === '<30ml' ? classes.btnActive : ''
              }`}
              onClick={() => setDrinkPerWeek('<30ml')}
            >
              &lt; 30ml
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${
                drinkPerWeek === '30ml-60ml' ? classes.btnActive : ''
              }`}
              onClick={() => setDrinkPerWeek('30ml-60ml')}
            >
              30ml-60ml
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${
                drinkPerWeek === '>60ml' ? classes.btnActive : ''
              }`}
              onClick={() => setDrinkPerWeek('>60ml')}
            >
              &gt; 60ml
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={drinkPerWeek.length === 0}
              onClick={() => {
                if (drinkPerWeek.length > 0) showNextSlide();
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
      </div>
    );
  };

  const temperatureInput = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <Grid item xs={10} sm={9} md={9} lg={9}>
            <label>What is your body temperature right now (in °F) ?</label>
            <AphButton
              className={`${classes.quesButton}  ${
                temperature === '99-100' ? classes.btnActive : ''
              }`}
              onClick={() => setTemperature('99-100')}
            >
              99-100
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${
                temperature === '100-101' ? classes.btnActive : ''
              }`}
              onClick={() => setTemperature('100-101')}
            >
              100-101
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${
                temperature === '102+' ? classes.btnActive : ''
              }`}
              onClick={() => setTemperature('102+')}
            >
              102+
            </AphButton>
            <AphButton
              className={`${classes.quesButton}  ${
                temperature === 'No Idea' ? classes.btnActive : ''
              }`}
              onClick={() => setTemperature('No Idea')}
            >
              No Idea
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={temperature.length === 0}
              onClick={() => {
                if (temperature.length > 0) {
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Temperature:\n${temperature}°F`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                  showNextSlide();
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
      </div>
    );
  };

  const bpInput = () => {
    return (
      <div>
        <Grid spacing={2} container>
          <label className={classes.bpLabel}>What is your blood pressure right now?</label>
          <Grid item xs={5} sm={4} md={4} lg={4}>
            <AphTextField
              autoFocus
              className={classes.searchInput}
              inputProps={{ type: 'text' }}
              placeholder="-- / --"
              value={bp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBp(e.target.value)}
            />
          </Grid>
          <Grid item xs={5} sm={5} md={5} lg={5}>
            <AphButton className={classes.quesButton} onClick={() => setBp('No Idea')}>
              No Idea
            </AphButton>
          </Grid>
          <Grid item xs={2} sm={3} md={3} lg={3}>
            <button
              className={classes.quesSubmitBtn}
              disabled={bp.length === 0 || consultQMutationLoading}
              onClick={() => {
                if (bp.match(/^\d{1,3}(\/|\\)\d{1,3}$/) || bp === 'No Idea') {
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: `Blood Pressure:\n${bp === 'No Idea' ? 'No Idea' : `${bp} mm/Hg`}`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);

                  // add to consult q with automated questions.
                  const lifeStyle = `Smoke: ${_startCase(smokeHabit)}${
                    smokeHabit === 'yes' ? ` ${smokes}` : ''
                  }, Drink: ${_startCase(drinkHabit)}${
                    drinkHabit === 'yes' ? ` ${drinkPerWeek}` : ''
                  }`;

                  setConsultQMutationLoading(true);

                  // console.log(lifeStyle, 'life style is...........');
                  mutationAddToConsultQ({
                    variables: {
                      ConsultQueueInput: {
                        appointmentId: appointmentId,
                        height: height,
                        weight: weight,
                        temperature: temperature,
                        bp: bp,
                        lifeStyle: lifeStyle,
                        familyHistory: '',
                        dietAllergies: dietAllergies,
                        drugAllergies: drugAllergies,
                      },
                    },
                  })
                    .then((response) => {
                      setAutoQuestionsCompleted(true);
                      console.log(response, 'response after mutation is.....');
                    })
                    .catch((error) => {
                      console.log(error, 'error after mutation.......');
                    });
                } else {
                  setBpError(true);
                }
              }}
            >
              <img src={require('images/ic_submit.svg')} alt="" />
            </button>
          </Grid>
        </Grid>
        {bpError && (
          <FormHelperText component="div" error={true}>
            Enter blood pressure in valid format (eg. 120/80)
          </FormHelperText>
        )}
      </div>
    );
  };

  const showNextSlide = () => {
    sliderRef.current.slickNext();
  };

  // console.log(messages, 'messages from pubnub.....');

  return (
    <div className={classes.consultRoom}>
      {/* Ot Errors Start */}
      <WarningModel
        error={sessionError}
        onClose={() => {
          setSessionError(null);
        }}
      />
      <WarningModel
        error={publisherError}
        onClose={() => {
          setPublisherError(null);
        }}
      />
      <WarningModel
        error={subscriberError}
        onClose={() => {
          setSubscriberError(null);
        }}
      />
      {/* Ot Errors Ends */}
      {playRingtone && (
        <audio controls autoPlay loop className={classes.ringtone}>
          <source src={ringtoneUrl} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      )}
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
            doctorDetails={props.doctorDetails}
            convertCall={() => convertCall()}
            videoCall={videoCall}
            audiocallmsg={audiocallmsg}
            setSessionError={setSessionError}
            setPublisherError={setPublisherError}
            setSubscriberError={setSubscriberError}
          />
        )}
        {/* <div className={`${classes.chatSection}`}> */}
        <div>
          {!showVideo && (
            <div>
              {isCalled && (
                <div className={classes.incomingCallContainer}>
                  <div className={classes.incomingCallWindow}>
                    <img
                      src={require('images/doctor_profile_image.png')}
                      // src={
                      //   profileImage !== null
                      //     ? profileImage
                      //     : require('images/doctor_profile_image.png')
                      // }
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
          <div className={classes.chatContainer}>
            <Scrollbars
              // className={`${classes.chatContainerSection} ${
              //   autoQuestionsCompleted ? '' : classes.chatContainerSectionques
              //   }`}
              autoHide={true}
              autoHeight
              autoHeightMax={'calc(100vh - 332px)'}
            >
              {messages.map((messageDetails: any) => {
                const cardType =
                  messageDetails.entry && messageDetails.entry.cardType
                    ? messageDetails.entry.cardType
                    : 'doctor';
                const message =
                  messageDetails.entry && messageDetails.entry.message
                    ? messageDetails.entry.message
                    : '';
                if (
                  messageDetails.entry.message === autoMessageStrings.typingMsg ||
                  messageDetails.entry.message === autoMessageStrings.endCallMsg ||
                  messageDetails.entry.message === autoMessageStrings.audioCallMsg ||
                  messageDetails.entry.message === autoMessageStrings.videoCallMsg ||
                  messageDetails.entry.message === autoMessageStrings.acceptedCallMsg ||
                  messageDetails.entry.message === autoMessageStrings.stopConsultMsg ||
                  messageDetails.entry.message === autoMessageStrings.startConsultMsg
                ) {
                  return null;
                }
                const duration = messageDetails.entry.duration;
                console.log(duration);
                if (cardType === 'welcome') {
                  return <WelcomeCard doctorName={doctorDisplayName} />;
                } else if (cardType === 'doctor') {
                  return <DoctorCard message={message} duration={duration} />;
                } else {
                  return (
                    <PatientCard
                      message={message}
                      duration={duration}
                      chatTime={messageDetails.entry.messageDate}
                    />
                  );
                }
              })}
              <span id="scrollDiv" ref={scrollDivRef}></span>
            </Scrollbars>
          </div>
          {autoQuestionsCompleted ? (
            <div className={`${classes.chatWindowFooter} ${classes.chatWindowFooterInput}`}>
              <AphTextField
                autoFocus
                className={classes.searchInput}
                inputProps={{ type: 'text' }}
                placeholder="Type here..."
                value={userMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUserMessage(e.target.value)
                }
                onKeyPress={(e: any) => {
                  if ((e.which == 13 || e.keyCode == 13) && userMessage.trim() !== '') {
                    const composeMessage = {
                      id: currentPatient && currentPatient.id,
                      message: e.target.value,
                      automatedText: '',
                      duration: '',
                      url: '',
                      transferInfo: '',
                      messageDate: new Date(),
                      cardType: 'patient',
                    };
                    publishMessage(appointmentId, composeMessage);
                    setUserMessage('');
                  }
                }}
              />
              <AphButton
                className={classes.chatSend}
                disabled={userMessage.length === 0}
                onClick={() => {
                  const composeMessage = {
                    id: currentPatient && currentPatient.id,
                    message: userMessage,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                  setUserMessage('');
                }}
              >
                <img src={require('images/ic_send.svg')} alt="" />
              </AphButton>
              <AphButton
                className={classes.chatSubmitBtn}
                onClick={() => {
                  setIsUploadPreDialogOpen(true);
                }}
              >
                <img
                  src={require('images/ic_paperclip.svg')}
                  alt="Upload Records"
                  title="Upload Records"
                />
                <span>Upload Records</span>
              </AphButton>
            </div>
          ) : !appDataLoading ? (
            <div className={classes.quesContainer}>
              <Slider
                {...sliderSettings}
                className={classes.slider}
                ref={(slider) => (sliderRef.current = slider)}
              >
                {heightQuestionContent()}
                {weightQuestionContent()}
                {drugAlergyQuestionChoice()}
                {drugAllergy === 'yes' && drugsInput()}
                {foodAlergyQuestionChoice()}
                {dietAllergy === 'yes' && foodAlergyInput()}
                {smokeQuestionChoice()}
                {smokeHabit === 'yes' && smokeInput()}
                {drinkQuestionChoice()}
                {drinkHabit === 'yes' && drinkInput()}
                {temperatureInput()}
                {bpInput()}
              </Slider>
            </div>
          ) : null}
          <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
            <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
            <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
            <UploadChatPrescription
              closeDialog={() => {
                setIsUploadPreDialogOpen(false);
              }}
              appointmentId={props.appointmentId}
              displayName={doctorDisplayName}
              setIsEPrescriptionOpen={setIsEPrescriptionOpen}
            />
          </AphDialog>
          <AphDialog open={isEPrescriptionOpen} maxWidth="sm">
            <AphDialogClose
              onClick={() => {
                setIsEPrescriptionOpen(false);
              }}
              title={'Close'}
            />
            <AphDialogTitle className={classes.ePrescriptionTitle}>E Prescription</AphDialogTitle>
            <UploadChatEPrescriptionCard
              setIsEPrescriptionOpen={setIsEPrescriptionOpen}
              appointmentId={props.appointmentId}
            />
          </AphDialog>
        </div>
      </div>
    </div>
  );
};
