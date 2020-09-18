import React, { useEffect, useState, useRef } from 'react';
import { Theme, Grid, Button, MenuItem, Modal } from '@material-ui/core';
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
import { BookRescheduleAppointmentInput, STATUS } from 'graphql/types/globalTypes';
// import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import FormHelperText from '@material-ui/core/FormHelperText';
import PubNub, { PubnubStatus, PublishResponse, HistoryResponse } from 'pubnub';
import _startCase from 'lodash/startCase';
import { useMutation } from 'react-apollo-hooks';
import {
  JOIN_JDQ_WITH_AUTOMATED_QUESTIONS,
  GET_APPOINTMENT_DATA,
  UPDATE_APPOINTMENT_SESSION,
  PAST_APPOINTMENTS_COUNT,
  UPDATE_SAVE_EXTERNAL_CONNECT,
} from 'graphql/consult';
import { downloadDocuments } from 'graphql/types/downloadDocuments';
import { DOWNLOAD_DOCUMENT } from 'graphql/profiles';
import {
  AddToConsultQueueWithAutomatedQuestions,
  AddToConsultQueueWithAutomatedQuestionsVariables,
} from 'graphql/types/AddToConsultQueueWithAutomatedQuestions';
import {
  UpdateAppointmentSession,
  UpdateAppointmentSessionVariables,
} from 'graphql/types/UpdateAppointmentSession';
import {
  GetPastAppointmentsCount,
  GetPastAppointmentsCountVariables,
} from 'graphql/types/GetPastAppointmentsCount';
import {
  UpdateSaveExternalConnect,
  UpdateSaveExternalConnectVariables,
} from 'graphql/types/UpdateSaveExternalConnect';
import { useApolloClient } from 'react-apollo-hooks';
import { UploadChatPrescription } from 'components/Consult/V2/ChatRoom/UploadChatPrescriptions';
import { UploadChatEPrescriptionCard } from 'components/Consult/V2/ChatRoom/UploadChatEPrescriptionCard';
import CircularProgress from '@material-ui/core/CircularProgress';
import { BookAppointmentCard } from 'components/Consult/V2/ChatRoom/BookAppointmentCard';
import { isPastAppointment } from 'helpers/commonHelpers';
import { useParams } from 'hooks/routerHooks';
import { GetAppointmentData_getAppointmentData_appointmentsHistory as AppointmentHistory } from 'graphql/types/GetAppointmentData';
import { DoctorJoinedMessageCard } from 'components/Consult/V2/ChatRoom/DoctorJoinedMessageCard';

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
        padding: '0px 45px 0px 10px !important',
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
      left: 17,
      bottom: 0,
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
      backgroundColor: '#fff',
      maxWidth: 440,
      margin: 'auto',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.2)',
      color: '#01475B',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    modalHeader: {
      minHeight: 40,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 0.5,
      color: theme.palette.common.white,
      padding: '10px 50px',
      textTransform: 'uppercase',
      position: 'relative',
      wordBreak: 'break-word',
    },
    modalClose: {
      position: 'absolute',
      right: 10,
      top: 10,
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
    modalPopupContent: {
      maxHeight: 'calc(100vh - 180px)',
      paddingBottom: 30,
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
      marginTop: 50,
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
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
    modalHeading: {
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '21px',
      marginBottom: 5,
    },
    modalsubHeading: {
      fontWeight: 'normal',
      fontSize: 16,
      lineHeight: '21px',
      margin: '5px auto 20px auto',
      maxWidth: 280,
    },
    modalButton: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      marginRight: 15,
      padding: 8,
      minWidth: 132,
      marginBottom: 10,
      color: '#FC9916',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    modalNone: {
      display: 'none',
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
  doctorDetails: DoctorDetails;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  nextSlotAvailable: string;
  availableNextSlot: (slotDoctorId: string, todayDate: Date) => void;
  rescheduleAPI: (bookRescheduleInput: BookRescheduleAppointmentInput) => void;
  jrDoctorJoined: boolean;
  setJrDoctorJoined: (jrDoctorJoined: boolean) => void;
  setSrDoctorJoined: (srDoctorJoined: boolean) => void;
  setIsConsultCompleted: (isConsultCompleted: boolean) => void;
  appointmentDetails: AppointmentHistory;
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
}
let insertText: MessagesObjectProps[] = [];
let timerIntervalId: any;
let stoppedConsulTimer: number;
const ringtoneUrl = require('../../../../images/phone_ringing.mp3');
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

type Params = { appointmentId: string; doctorId: string };

export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const { appointmentDetails } = props;
  const { appointmentId, doctorId } = params;
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
  // const [newMessage, setNewMessage] = useState<any>('');
  const [drugAllergyError, setDrugAllergyError] = useState<boolean>(false);
  const [dietAllergyError, setDietAllergyError] = useState<boolean>(false);
  const [bpError, setBpError] = useState<boolean>(false);
  const [autoQuestionsCompleted, setAutoQuestionsCompleted] = useState(
    appointmentDetails ? appointmentDetails.isJdQuestionsComplete : false
  );
  const [userMessage, setUserMessage] = useState<string>('');
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [appHistoryLoading, setAppHistoryLoading] = useState<boolean>(true);
  const [consultQMutationLoading, setConsultQMutationLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [imgPrevUrl, setImgPrevUrl] = React.useState<any>();
  const [doctorInteractionModal, setDoctorInteractionModal] = useState(true);

  const { currentPatient } = useAllCurrentPatients();
  const doctorDisplayName = props.doctorDetails.getDoctorDetailsById.displayName;
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

  const mutationUpdateSaveExternalConnect = useMutation<
    UpdateSaveExternalConnect,
    UpdateSaveExternalConnectVariables
  >(UPDATE_SAVE_EXTERNAL_CONNECT);

  const getPrismUrls = (patientId: string, fileIds: string[]) => {
    return new Promise((res, rej) => {
      apolloClient
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            downloadDocumentsInput: {
              patientId: patientId,
              fileIds: fileIds,
            },
          },
        })
        .then(({ data }) => {
          res({
            urls: data && data.downloadDocuments && data.downloadDocuments.downloadPaths,
          });
        })
        .catch((err: any) => {
          console.log(err);
        });
    });
  };
  const pubnubClient = new PubNub({
    publishKey: process.env.PUBLISH_KEY,
    subscribeKey: process.env.SUBSCRIBE_KEY,
    uuid: currentPatient && currentPatient.id,
    ssl: false,
    origin: 'apollo.pubnubapi.com',
  });

  const scrollToBottomAction = () => {
    setTimeout(() => {
      const scrollDiv = scrollDivRef.current;
      scrollDiv.scrollIntoView();
    }, 200);
  };

  // subscribe for any udpates

  useEffect(() => {
    if (appointmentDetails) {
      const getPastAppointmentsWithTheDoctor = (
        doctorId: string,
        patientId: string,
        appointmentId: string
      ) => {
        setAppHistoryLoading(true);
        apolloClient
          .query<GetPastAppointmentsCount, GetPastAppointmentsCountVariables>({
            query: PAST_APPOINTMENTS_COUNT,
            variables: {
              doctorId: doctorId,
              patientId: patientId,
              appointmentId: appointmentId,
            },
            fetchPolicy: 'no-cache',
          })
          .then((response) => {
            setAppHistoryLoading(false);
            if (response && response.data && response.data.getPastAppointmentsCount) {
              const appointmentsCount = response.data.getPastAppointmentsCount;
              const yesCount = appointmentsCount.yesCount;
              if (yesCount > 0) {
                setDoctorInteractionModal(false);
              } else {
                setDoctorInteractionModal(true);
              }
            }
          })
          .catch((e) => {
            setAppHistoryLoading(false);
            console.log(e);
          });
      };

      if (appointmentDetails) {
        getPastAppointmentsWithTheDoctor(doctorId, currentPatient.id, appointmentDetails.id);
        // console.log(appointmentDetails, '===========================');
      }
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
          insertText[insertText.length] = message.message;
          setMessages(() => [...insertText]);
          scrollToBottomAction();
        },
      });

      // get latest 100 messages
      pubnubClient.history(
        { channel: appointmentId, count: 100, stringifiedTimeToken: true },
        (status: PubnubStatus, response: HistoryResponse) => {
          if (response.messages.length === 0) sendWelcomeMessage();
          const newmessage: MessagesObjectProps[] = messages;
          response.messages.forEach((element: any, index: number) => {
            const item = element.entry;
            if (item.prismId) {
              getPrismUrls(currentPatient && currentPatient.id, item.prismId).then((data: any) => {
                item.url = (data && data.urls[0]) || item.url;
              });
              newmessage[index] = item;
            } else {
              newmessage.push(element.entry);
            }
          });
          insertText = newmessage;
          setMessages(newmessage);
          scrollToBottomAction();
        }
      );
      return function cleanup() {
        pubnubClient.unsubscribe({ channels: [appointmentId] });
      };
    }
  }, [appointmentDetails]);

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
    setShowVideoChat(false);
    publishMessage(appointmentId, composeMessage);
    setPlayRingtone(false);
    updateAppointmentSessionCall();
    startIntervalTimer(0);
    setCookiesAcceptcall();
    setShowVideo(true);
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
    const cookieStr = `action=${isVideoCall ? 'videocall' : 'audiocall'}`;
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
                    height.match(/^[0-9]{1,2}('|’)(?:\s*(?:1[01]|[0-9])(''|"|’’|”))?$/)) ||
                  !height.length
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
            Enter height in valid format (eg. 5'8" ft or 172 cm)
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
                  if (drugAllergy === 'yes') showNextSlide();
                  else slickGotoSlide(4);
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
                  if (dietAllergy === 'yes') showNextSlide();
                  else slickGotoSlide(6);
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
            <AphButton
              className={`${classes.quesButton}  ${
                smokeHabit === 'ex-smoker' ? classes.btnActive : ''
              }`}
              onClick={() => setSmokeHabit('ex-smoker')}
            >
              Ex-Smoker
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
                    message: `Smoke:\n${
                      smokeHabit === 'ex-smoker' ? 'Ex-Smoker' : _startCase(smokeHabit) // needed for lodash
                    }`,
                    automatedText: '',
                    duration: '',
                    url: '',
                    transferInfo: '',
                    messageDate: new Date(),
                    cardType: 'patient',
                  };
                  publishMessage(appointmentId, composeMessage);
                  if (smokeHabit === 'yes') {
                    showNextSlide();
                  } else if (smokeHabit === 'ex-smoker') {
                    setSmokes('Ex-Smoker');
                    slickGotoSlide(8);
                  } else {
                    slickGotoSlide(8);
                  }
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
                  if (drinkHabit === 'yes') showNextSlide();
                  else slickGotoSlide(10);
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
              &lt; 10
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
                    message: `Temperature:\n${temperature} ${
                      temperature !== 'No Idea' ? '°F' : ''
                    }`,
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

  const slickGotoSlide = (slideNo: number) => {
    sliderRef.current.slickGoTo(slideNo);
  };
  const getCardType = (messageDetails: any) => {
    if (messageDetails && messageDetails.cardType) {
      return messageDetails.cardType;
    } else if (messageDetails.id === currentPatient.id) {
      return 'patient';
    } else {
      return 'doctor';
    }
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
                      // console.log(response, 'response after mutation is.....');
                    })
                    .catch((error) => {
                      // console.log(error, 'error after mutation.......');
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

  // console.log(autoQuestionsCompleted);

  const showNextSlide = () => {
    sliderRef.current.slickNext();
  };

  const pastAppointment =
    appointmentDetails && isPastAppointment(appointmentDetails.appointmentDateTime);

  // console.log(messages, 'messages from pubnub.....');

  return (
    <>
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
                        src={
                          props.doctorDetails &&
                          props.doctorDetails.getDoctorDetailsById &&
                          props.doctorDetails.getDoctorDetailsById.photoUrl !== null
                            ? props.doctorDetails.getDoctorDetailsById.photoUrl
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
                  const cardType = getCardType(messageDetails);
                  const message =
                    messageDetails && messageDetails.message ? messageDetails.message : '';
                  if (
                    messageDetails.message === autoMessageStrings.typingMsg ||
                    messageDetails.message === autoMessageStrings.endCallMsg ||
                    messageDetails.message === autoMessageStrings.audioCallMsg ||
                    messageDetails.message === autoMessageStrings.videoCallMsg ||
                    messageDetails.message === autoMessageStrings.acceptedCallMsg ||
                    messageDetails.message === autoMessageStrings.stopConsultMsg ||
                    messageDetails.message === autoMessageStrings.startConsultMsg ||
                    messageDetails.message === autoMessageStrings.covertVideoMsg ||
                    messageDetails.message === autoMessageStrings.covertAudioMsg ||
                    messageDetails.message === autoMessageStrings.appointmentComplete ||
                    messageDetails.message === autoMessageStrings.jdThankyou ||
                    messageDetails.message === autoMessageStrings.startConsultjr ||
                    messageDetails.message === autoMessageStrings.stopConsultJr ||
                    messageDetails.message === autoMessageStrings.languageQue ||
                    messageDetails.message === autoMessageStrings.consultPatientStartedMsg ||
                    messageDetails.message === autoMessageStrings.patientJoinedMeetingRoom
                  ) {
                    props.setSrDoctorJoined(
                      messageDetails.message === autoMessageStrings.startConsultMsg
                    );
                    props.setIsConsultCompleted(
                      messageDetails.message === autoMessageStrings.appointmentComplete
                    );
                    return messageDetails.message === '^^#startconsult' ? (
                      <DoctorJoinedMessageCard
                        doctorName={doctorDisplayName}
                        messageDate={messageDetails.messageDate}
                      />
                    ) : null;
                  }
                  const duration = messageDetails.duration;
                  if (cardType === 'welcome') {
                    return <WelcomeCard doctorName={doctorDisplayName} />;
                  } else if (cardType === 'doctor') {
                    return (
                      <DoctorCard
                        message={message}
                        duration={duration}
                        messageDetails={messageDetails}
                        setModalOpen={(flag: boolean) => setModalOpen(flag)}
                        setImgPrevUrl={(url: string) => setImgPrevUrl(url)}
                        chatTime={messageDetails.messageDate}
                        doctorName={
                          (appointmentDetails &&
                            appointmentDetails.doctorInfo &&
                            appointmentDetails.doctorInfo.displayName) ||
                          ''
                        }
                        appointmentDetails={appointmentDetails}
                      />
                    );
                  } else {
                    return (
                      <PatientCard
                        message={message}
                        duration={duration}
                        chatTime={messageDetails.messageDate}
                        messageDetails={messageDetails}
                        setModalOpen={(flag: boolean) => setModalOpen(flag)}
                        setImgPrevUrl={(url: string) => setImgPrevUrl(url)}
                      />
                    );
                  }
                })}
                <span id="scrollDiv" ref={scrollDivRef}></span>
              </Scrollbars>
            </div>
            {autoQuestionsCompleted ||
            appointmentDetails.isConsultStarted ||
            appointmentDetails.isJdQuestionsComplete ? (
              <>
                {pastAppointment && appointmentDetails && (
                  <BookAppointmentCard
                    doctorName={
                      (appointmentDetails && appointmentDetails.doctorInfo.fullName) || ''
                    }
                    doctorId={doctorId}
                  />
                )}
                <div className={`${classes.chatWindowFooter} ${classes.chatWindowFooterInput}`}>
                  <AphTextField
                    disabled={pastAppointment}
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
                    disabled={pastAppointment || userMessage.length === 0}
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
                    disabled={pastAppointment}
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
              </>
            ) : appointmentDetails ? (
              consultQMutationLoading || appHistoryLoading ? (
                <div className={classes.circlularProgress}>
                  <CircularProgress />
                </div>
              ) : (
                <div className={classes.quesContainer}>
                  <Slider
                    {...sliderSettings}
                    className={classes.slider}
                    ref={(slider) => (sliderRef.current = slider)}
                  >
                    {heightQuestionContent()}
                    {weightQuestionContent()}
                    {drugAlergyQuestionChoice()}
                    {drugsInput() /*slide 4 */}
                    {foodAlergyQuestionChoice()}
                    {foodAlergyInput() /*slide 6 */}
                    {smokeQuestionChoice()}
                    {smokeInput() /*slide 8 */}
                    {drinkQuestionChoice()}
                    {drinkInput() /*slide 10 */}
                    {temperatureInput()}
                    {bpInput()}
                  </Slider>
                </div>
              )
            ) : null}

            <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
              <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
              <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
              <UploadChatPrescription
                closeDialog={() => {
                  setIsUploadPreDialogOpen(false);
                }}
                appointmentId={appointmentId}
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
                appointmentId={appointmentId}
              />
            </AphDialog>
          </div>
        </div>
        {/* model popup for image preview start */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className={classes.modalWindowWrap}>
            <div className={classes.tableContent}>
              <div className={classes.modalWindow}>
                <div className={classes.modalHeader}>
                  <div className={classes.modalClose} onClick={() => setModalOpen(false)}>
                    <img src={require('images/ic_cross.svg')} alt="" />
                  </div>
                </div>
                <div className={classes.modalContent}>
                  <img src={imgPrevUrl} alt="" />
                  {/* <ReactPanZoom image={imgPrevUrl} alt="" /> */}
                </div>
                <div className={classes.modalFooter}></div>
              </div>
            </div>
          </div>
        </Modal>
        {/* model popup for image preview ends */}
      </div>
      {/* modal popup for doctor interaciton questions */}
      {!appHistoryLoading && appointmentDetails.status === STATUS.PENDING ? (
        <Modal open={doctorInteractionModal} onClose={() => setDoctorInteractionModal(false)}>
          <div
            className={
              doctorInteractionModal && !appHistoryLoading
                ? classes.modalWindowWrap
                : classes.modalNone
            }
          >
            <div className={classes.tableContent}>
              <div className={classes.modalWindow}>
                <div className={classes.modalHeader}>
                  <div
                    className={classes.modalClose}
                    onClick={() => setDoctorInteractionModal(false)}
                  >
                    <img src={require('images/ic_round_clear.svg')} alt="" />
                  </div>
                </div>
                <div className={`${classes.modalContent} ${classes.modalPopupContent}`}>
                  <div className={classes.modalHeading}>
                    Have you interacted with the doctor before?
                  </div>
                  <div className={classes.modalsubHeading}>
                    (This is to know more about your past health records)
                  </div>
                  <div>
                    <AphButton
                      className={classes.modalButton}
                      onClick={() => {
                        mutationUpdateSaveExternalConnect({
                          variables: {
                            appointmentId: appointmentId,
                            doctorId: doctorId,
                            externalConnect: false,
                            patientId: currentPatient && currentPatient.id,
                          },
                        })
                          .then(() => setDoctorInteractionModal(false))
                          .catch(() => {
                            setDoctorInteractionModal(false);
                          });
                      }}
                    >
                      No
                    </AphButton>
                    <AphButton
                      className={classes.modalButton}
                      onClick={() => {
                        mutationUpdateSaveExternalConnect({
                          variables: {
                            appointmentId: appointmentId,
                            doctorId: doctorId,
                            externalConnect: true,
                            patientId: currentPatient && currentPatient.id,
                          },
                        })
                          .then(() => setDoctorInteractionModal(false))
                          .catch(() => {
                            setDoctorInteractionModal(false);
                          });
                      }}
                    >
                      Yes
                    </AphButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      ) : (
        <Modal open={doctorInteractionModal} onClose={() => setDoctorInteractionModal(false)}>
          <div className={classes.modalNone}></div>
        </Modal>
      )}
      {/* modal popup for doctor interaciton questions */}
    </>
  );
};
