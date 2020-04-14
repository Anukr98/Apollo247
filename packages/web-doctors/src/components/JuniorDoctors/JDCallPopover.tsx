import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Button, Modal, MenuItem, Popover, Paper, FormHelperText } from '@material-ui/core';
import Pubnub from 'pubnub';
import moment from 'moment';
import { ApolloError } from 'apollo-client';
import { isEmpty } from 'lodash';
import { AphSelect, AphTextField, AphButton } from '@aph/web-ui-components';
import { useAuth, useCurrentPatient } from 'hooks/authHooks';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useMutation } from 'react-apollo-hooks';
import { useParams } from 'hooks/routerHooks';
import { CANCEL_APPOINTMENT } from 'graphql/profiles';
import { REMOVE_FROM_CONSULT_QUEUE } from 'graphql/consults';
import { REQUEST_ROLES, STATUS, DoctorType } from 'graphql/types/globalTypes';
import { CancelAppointment, CancelAppointmentVariables } from 'graphql/types/CancelAppointment';
import {
  RemoveFromConsultQueue,
  RemoveFromConsultQueueVariables,
} from 'graphql/types/RemoveFromConsultQueue';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { JDConsult } from 'components/JuniorDoctors/JDConsult';
import { CircularProgress } from '@material-ui/core';
import { JDConsultRoomParams } from 'helpers/clientRoutes';

const handleBrowserUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  event.returnValue = '';
};
const subscribeBrowserButtonsListener = () => {
  window.addEventListener('beforeunload', handleBrowserUnload);
};
const unSubscribeBrowserButtonsListener = () => {
  window.removeEventListener('beforeunload', handleBrowserUnload);
};

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '30px 0 50px 0',
      '& p': {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.28,
        color: '#02475b',
        marginTop: 10,
        marginBottom: 10,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },
    helpText: {
      paddingLeft: 0,
      paddingRight: 20,
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      padding: '35px 20px',
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      lineHeight: 1.86,
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    consultButton: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      marginLeft: 20,
      minWidth: 168,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
      '&:disabled': {
        backgroundColor: '#fdd49c',
      },
      '& svg': {
        marginRight: 5,
      },
    },
    endconsultButton: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightBold,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      marginLeft: 20,
      minWidth: 168,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
      '& svg': {
        marginRight: 5,
      },
    },
    loading: {
      position: 'absolute',
      top: 400,
      left: '50%',
      zIndex: 9999,
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
    ResheduleCosultButton: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      minWidth: 168,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#fc9916',
      },
      '&:disabled': {
        backgroundColor: 'rgba(252,153,22,0.3)',
      },
    },
    cancelConsult: {
      minWidth: 120,
      fontSize: 14,
      padding: '8px 16px',
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(0, 1, 0, 1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    cancelConsultError: {
      fontSize: 10,
      padding: '2px 16px',
      fontWeight: 400,
      color: 'red',
    },
    timeLeft: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
      textTransform: 'capitalize',
      position: 'relative',
      top: -1,
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 20,
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
    loginForm: {
      width: 280,
      minHeight: 282,
      padding: '10px 20px 20px 20px',
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    consultButtonContainer: {
      position: 'absolute',
      right: 0,
    },
    cross: {
      position: 'absolute',
      right: 0,
      top: 7,
      fontSize: '18px',
      color: '#02475b',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      backgroundColor: '#f7f7f7',
      paddingBottom: 95,
    },
    audioVideoContainer: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      backgroundColor: '#f7f7f7',
      paddingBottom: 0,
    },
    needHelp: {
      padding: '8px',
      width: '100%',
      marginTop: 15,
      borderRadius: '5px',
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.3)',
      fontWeight: 'bold',
      backgroundColor: '#fc9916',
      '& img': {
        marginRight: 10,
      },
    },
    consultIcon: {
      padding: 6,
      backgroundColor: 'transparent',
      margin: '0 5px',
      minWidth: 20,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&:disabled': {
        opacity: 0.7,
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 13,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(0, 1, 0, 1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    popOverUL: {
      listStyleType: 'none',
      textAlign: 'center',
      display: 'inline',
      paddingBottom: 0,
      paddingLeft: 0,
      '& li': {
        fontSize: '15px',
        fontWeight: 500,
        paddingLeft: '20px',
        fontStyle: 'normal',
        fontStretch: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        color: '#02475b',
        paddingBottom: 15,
        paddingRight: 20,
        paddingTop: 15,
        textAlign: 'left',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(2,71,91,0.2)',
        '&:hover': {
          background: '#f0f4f5',
        },
        '&:last-child': {
          borderBottom: 'none',
        },
      },
    },

    dotPaper: {
      padding: 0,
      borderRadius: 0,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      '& .MuiPaper-rounded': {
        borderRadius: 10,
      },
    },
    modalBox: {
      maxWidth: 480,
      height: 340,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
      position: 'relative',
    },
    modalBoxCancel: {
      maxWidth: 480,
      minHeight: 280,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
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
    tabHeader: {
      background: 'white',
      height: 50,
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
      '& h4': {
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        color: '#01475b',
        padding: '17px 20px',
        textTransform: 'uppercase',
      },
    },
    tabFooter: {
      background: 'white',
      position: 'absolute',
      borderBottomLeftRadius: '10px',
      borderBottomRightRadius: '10px',
      width: '480px',
      bottom: '0px',
      textAlign: 'right',
      padding: '16px 20px 16px 0',
    },
    tabBody: {
      background: 'white',
      minHeight: 80,
      margin: 20,
      padding: '10px 15px 15px 15px',
      borderRadius: 5,
      '& p': {
        margin: 0,
        fontSize: '15px',
        fontWeight: 500,
        lineHeight: 1.2,
        color: '#01475b',
        paddingBottom: 5,
        paddingTop: 10,
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginLeft: -2,
      marginTop: 45,
      borderRadius: 10,
      left: '270px',
      width: '450px',
      '& ul': {
        padding: '10px 0px',
        '& li': {
          fontSize: 18,
          width: 480,
          fontWeight: 500,
          color: '#02475b',
          minHeight: 'auto',
          paddingLeft: 10,
          paddingRight: 10,
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:hover': {
            backgroundColor: '#f0f4f5',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    cancelBtn: {
      minWidth: 30,
      margin: theme.spacing(1),
      fontSize: 15,
      fontWeight: 500,
      color: '#02575b',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    searchInput: {
      paddingLeft: 0,
      paddingRight: 0,
      marginTop: 10,
    },
    textFieldColor: {
      '& input': {
        marginTop: 5,
        color: 'initial',
        border: '2px solid #00b38e ',
        paddingTop: '15px',
        paddingBottom: '15px',
        borderRadius: 10,
        paddingLeft: 10,
        '& :before': {
          border: 0,
        },
      },
    },
    doctorSearch: {
      display: 'block',
      padding: 10,
      zIndex: 9,
      backgroundColor: '#fff',
      borderRadius: 10,
      position: 'absolute',
      width: '95%',
      maxHeight: 200,
      overflow: 'auto',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.8)',
      '& h6': {
        color: 'rgba(2,71,91,0.3)',
        fontSize: 12,
        marginBottom: 5,
        marginTop: 12,
        fontWeight: 500,
      },
      '& ul': {
        listStyleType: 'none',
        paddingLeft: 0,
        marginTop: 0,
        '& li': {
          fontSize: 18,
          color: '#02475b',
          fontWeight: 500,
          '&:hover': {
            cursor: 'pointer',
          },
        },
      },
      '& p': {
        borderBottom: '1px solid #01475b',
      },
    },
    othercases: {
      marginTop: 10,
    },
    posRelative: {
      position: 'relative',
    },
    pageSubHeader: {
      padding: 16,
      display: 'flex',
    },
    headerLeftGroup: {
      display: 'flex',
      alignItems: 'center',
    },
    headerRightGroup: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',

      '& >div': {
        paddingLeft: 20,
      },
      '& >button': {
        marginLeft: 20,
      },
    },
    iconButton: {
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
    },
    saveBtn: {
      backgroundColor: theme.palette.common.white,
      minWidth: 175,
      borderRadius: 10,
      color: '#fc9916',
      padding: '9px 13px 9px 13px',
      boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: theme.palette.common.white,
        color: '#fc9916',
      },
    },
    saveBtnDisabled: {
      opacity: 0.5,
      color: '#fc9916 !important',
    },
    submitBtn: {
      minWidth: 216,
      borderRadius: 10,
      marginLeft: 20,
    },
    consultName: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'initial',
    },
    consultDur: {
      fontSize: 12,
      fontWeight: 500,
      // paddingLeft: 12,
      // marginLeft: 12,
      display: 'block',
      color: 'red',
      '& span': {
        fontWeight: 'bold',
      },
    },
    consultDurShow: {
      display: 'block',
    },
    consultMenuPopover: {
      minWidth: 160,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.4)',
      backgroundColor: theme.palette.common.white,
      marginTop: 14,
    },
    menuBtnGroup: {
      padding: 6,
      '& button': {
        boxShadow: 'none',
        borderRadius: 0,
        backgroundColor: 'transparent',
        fontSize: 15,
        fontWeight: 500,
        color: '#02475b',
        padding: 10,
        display: 'block',
        textTransform: 'none',
        width: '100%',
        textAlign: 'left',
        lineHeight: '15px',
      },
    },
  };
});

interface errorObject {
  reasonError: boolean;
  searchError: boolean;
  otherErrorCancel: boolean;
}
interface errorObjectReshedule {
  otherError: boolean;
}
interface assignedDoctorType {
  assignedDoctorSalutation: string;
  assignedDoctorFirstName: string;
  assignedDoctorLastName: string;
  assignedDoctorDisplayName: string;
}
interface CallPopoverProps {
  setStartConsultAction(isVideo: boolean): void;
  createSessionAction: () => void;
  saveCasesheetAction: (onlySave: boolean, endConsult: boolean) => void;
  endConsultAction: () => void;
  appointmentId: string;
  appointmentDateTime: string;
  doctorId: string;
  isEnded: boolean;
  caseSheetId: string;
  prescriptionPdf: string;
  sessionId: string;
  token: string;
  saving: boolean;
  startAppointmentClick: (startAppointment: boolean) => void;
  startAppointment: boolean;
  assignedDoctor: assignedDoctorType;
  isAudioVideoCallEnded: (isAudioVideoCall: boolean) => void;
  endCallNotificationAction: (callId: boolean) => void;
  hasCameraMicPermission: boolean;
}

let intervalId: any;
let stoppedTimer: number;
let transferObject: any = {
  appointmentId: '',
  transferDateTime: '',
  photoUrl: '',
  doctorId: '',
  specialtyId: '',
  doctorName: '',
  experience: '5 Yrs',
  specilty: '',
  facilityId: '',
  transferId: '',
};
let timerIntervalId: any;
let stoppedConsulTimer: number;
let countdowntimer: any;
export const JDCallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles();
  const params = useParams<JDConsultRoomParams>();

  const { appointmentInfo, patientDetails } = useContext(CaseSheetContextJrd);
  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';
  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const stopcallMsg = '^^callme`stop^^';
  const acceptcallMsg = '^^callme`accept^^';
  const startConsultjr = '^^#startconsultJr';
  const stopConsultJr = '^^#stopconsultJr';
  const transferconsult = '^^#transferconsult';
  const rescheduleconsult = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const patientConsultStarted = '^^#PatientConsultStarted';
  const firstMessage = '^^#firstMessage';
  const secondMessage = '^^#secondMessage';
  const languageQue = '^^#languageQue';
  const jdThankyou = '^^#jdThankyou';
  const cancelConsultInitiated = '^^#cancelConsultInitiated';
  const callAbandonment = '^^#callAbandonment';
  const appointmentComplete = '^^#appointmentComplete';

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [remainingConsultStartTime, setRemainingConsultStartTime] = React.useState<number>(-1);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
  // const startConsultDisableReason =
  //   appointmentInfo!.appointmentState === 'AWAITING_RESCHEDULE'
  //     ? 'This appointment is under reschedule and waiting for the patient to accept the new slot.'
  //     : '';

  const [startTimerAppoinment, setstartTimerAppoinment] = React.useState<boolean>(false);
  const [startingTime, setStartingTime] = useState<number>(0);
  // timer for audio/video call start
  const timerMinuts = Math.floor(startingTime / 60);
  const timerSeconds = startingTime - timerMinuts * 60;
  const timerLastMinuts = Math.floor(startingTime / 60);
  const timerLastSeconds = startingTime - timerMinuts * 60;
  const startIntervalTimer = (timer: number) => {
    setstartTimerAppoinment(true);
    timerIntervalId = setInterval(() => {
      timer = timer + 1;
      stoppedConsulTimer = timer;
      setStartingTime(timer);
    }, 1000);
  };
  // timer for audio/video call end
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  //const [startAppointmentButton, setStartAppointmentButton] = React.useState<boolean>(true);
  const [disableOnCancel, setDisableOnCancel] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isCancelPopoverOpen, setIsCancelPopoverOpen] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('I am running late from previous consult');
  const [cancelReason, setCancelReason] = useState<string>('Not related to my specialty');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [textOther, setTextOther] = useState(false);
  const [otherTextValue, setOtherTextValue] = useState('');
  const [textOtherCancel, setTextOtherCancel] = useState(false);
  const [otherTextCancelValue, setOtherTextCancelValue] = useState('');
  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();
  const { sessionClient } = useAuth();
  const [anchorElThreeDots, setAnchorElThreeDots] = React.useState(null);
  const [errorState, setErrorState] = React.useState<errorObject>({
    reasonError: false,
    searchError: false,
    otherErrorCancel: false,
  });
  const [errorStateReshedule, setErrorStateReshedule] = React.useState<errorObjectReshedule>({
    otherError: false,
  });
  // audioVideoChat start
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [isCallAccepted, setIsCallAccepted] = useState<boolean>(false);
  const [isNewMsg, setIsNewMsg] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  const toggelChatVideo = () => {
    setIsNewMsg(false);
    setShowVideoChat(!showVideoChat);
  };
  const stopIntervalTimer = () => {
    setStartingTime(0);
    timerIntervalId && clearInterval(timerIntervalId);
  };
  const [disableStartConsult, setDisableStartConsult] = useState<boolean>(false);

  useEffect(() => {
    if (isCallAccepted) {
      props.isAudioVideoCallEnded(true);
      startIntervalTimer(0);
    }
  }, [isCallAccepted]);
  useEffect(() => {
    if (props.sessionId !== '') {
      onStartConsult();
      startInterval(900);
    }
  }, [props.sessionId]);

  const stopAudioVideoCall = () => {
    setIsCallAccepted(false);
    setShowVideo(false);
    setShowVideoChat(false);
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    props.isAudioVideoCallEnded(false);
    const text = {
      id: props.doctorId,
      message: stopcallMsg,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    setDisableOnCancel(false);
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
    const stoptext = {
      id: props.doctorId,
      message: `${isVideoCall ? 'Video' : 'Audio'} call ended`,
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds}`,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    pubnub.publish(
      {
        channel: channel,
        message: stoptext,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
    stopIntervalTimer();
    props.endCallNotificationAction(true);
  };
  const autoSend = (callType: string) => {
    const text = {
      id: props.doctorId,
      message: callType,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
    actionBtn();
  };
  const actionBtn = () => {
    setShowVideo(true);
  };
  const stopAudioVideoCallpatient = () => {
    setIsCallAccepted(false);
    setShowVideo(false);
    setShowVideoChat(false);
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const text = {
      id: props.doctorId,
      message: stopcallMsg,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    props.isAudioVideoCallEnded(false);
    setDisableOnCancel(false);
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
    stopIntervalTimer();
  };
  const convertCall = () => {
    setConvertVideo(!convertVideo);
    setTimeout(() => {
      pubnub.publish(
        {
          message: {
            isTyping: true,
            message: convertVideo ? covertVideoMsg : covertAudioMsg,
            messageDate: new Date(),
            sentBy: REQUEST_ROLES.JUNIOR,
          },
          channel: channel,
          storeInHistory: false,
        },
        (status, response) => {}
      );
    }, 10);
  };
  // audioVideo chat end
  const clearError = () => {
    setErrorState({
      ...errorState,
      searchError: false,
      reasonError: false,
      otherErrorCancel: false,
    });
  };
  const clearOtherError = () => {
    setErrorStateReshedule({
      ...errorStateReshedule,
      otherError: false,
    });
  };

  const startInterval = (timer: number) => {
    const current = new Date();
    const consult = new Date(props.appointmentDateTime);
    const year = consult.getFullYear();
    const month = consult.getMonth() + 1;
    const day = consult.getDate();
    let hour = consult.getHours();
    let minute = consult.getMinutes() + 15;
    const second = consult.getSeconds();
    if (minute > 59) {
      const diff = minute - 60;
      hour = hour + 1;
      if (hour === 14) {
        hour = 0;
      }
      minute = diff;
    }
    const addedMinutes = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    const addedTime = new Date(addedMinutes);
    if (current > consult && addedTime > current) {
      const diffrent = current.getTime() - consult.getTime();
      timer = 900 - Math.floor(diffrent / 1000);
    }
    intervalId = setInterval(() => {
      timer = timer - 1;
      stoppedTimer = timer;
      setRemainingTime(timer);
      if (timer == 0) {
        setRemainingTime(0);
        clearInterval(intervalId);
      }
    }, 1000);
  };
  const checkTimeRemainToConsult = () => {
    const disablecurrent = new Date();
    const disableconsult = new Date(props.appointmentDateTime);
    //console.log(disablecurrent, disableconsult, '111111111');
    const diff = moment.duration(disableconsult.getTime() - disablecurrent.getTime()).minutes() + 1;
    console.log(diff);
    if (disablecurrent >= disableconsult) {
      setRemainingConsultStartTime(0);
    } else if (diff <= 0) {
      setRemainingConsultStartTime(0);
    } else {
      //console.log(new Date(disableconsult.getTime() - disablecurrent.getTime()).getMinutes());
      // const diff = (disableconsult.getTime() - disablecurrent.getTime()) / 1000;
      // const diffMins = diff / 60;
      // setRemainingConsultStartTime(Math.round(diffMins));
      setRemainingConsultStartTime(diff);
    }
  };

  // const startConstultCheck = () => {
  //   const disablecurrent = new Date();
  //   const disableconsult = new Date(props.appointmentDateTime);
  //   const disableyear = disableconsult.getFullYear();
  //   const disablemonth = disableconsult.getMonth() + 1;
  //   const disableday = disableconsult.getDate();
  //   let disablehour = disableconsult.getHours();
  //   let disableminute = disableconsult.getMinutes() + 15;
  //   const minusTime = new Date(disableconsult.getTime() - 15 * 60000);
  //   const disablesecond = disableconsult.getSeconds();
  //   if (disableminute > 59) {
  //     const disablediff = disableminute - 60;
  //     disablehour = disablehour + 1;
  //     if (disablehour === 24) {
  //       disablehour = 0;
  //     }
  //     disableminute = disablediff;
  //   }
  //   const disableaddedMinutes =
  //     disableyear +
  //     '-' +
  //     (disablemonth < 10 ? '0' + disablemonth : disablemonth) +
  //     '-' +
  //     (disableday < 10 ? '0' + disableday : disableday) +
  //     ' ' +
  //     (disablehour < 10 ? '0' + disablehour : disablehour) +
  //     ':' +
  //     (disableminute < 10 ? '0' + disableminute : disableminute) +
  //     ':' +
  //     (disablesecond < 10 ? '0' + disablesecond : disablesecond);
  //   const disableaddedTime = new Date(disableaddedMinutes.replace(/-/g, '/'));
  //   var diff = (disablecurrent.getTime() - disableconsult.getTime()) / 1000;
  //   diff /= 60;
  //   console.log(Math.abs(Math.round(diff)));

  //   console.log(disableconsult, disablecurrent);
  //   if (
  //     disablecurrent >= minusTime &&
  //     disableaddedTime >= disablecurrent &&
  //     localStorage.getItem('loggedInMobileNumber') !== currentPatient!.delegateNumber
  //   ) {
  //     setStartAppointmentButton(false);
  //   } else {
  //     setStartAppointmentButton(true);
  //   }
  //   if (appointmentInfo!.appointmentState === 'AWAITING_RESCHEDULE') {
  //     setStartConsultDisableReason(
  //       'This appointment is under reschedule and waiting for the patient to accept the new slot.'
  //     );
  //   }
  // };
  const stopInterval = () => {
    setRemainingTime(900);
    intervalId && clearInterval(intervalId);
  };
  function handleClick(event: any) {
    if (startAppointment) {
      setAnchorEl(event.currentTarget);
    }
  }
  function handleClose() {
    setAnchorEl(null);
  }
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  function handleClickThreeDots(event: any) {
    setAnchorElThreeDots(event.currentTarget);
  }
  function handleCloseThreeDots() {
    setAnchorElThreeDots(null);
  }
  const openThreeDots = Boolean(anchorElThreeDots);
  const idThreeDots = openThreeDots ? 'simple-three-dots' : undefined;
  const channel = props.appointmentId;
  const subscribekey: string = process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '';
  const publishkey: string = process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '';
  const config: Pubnub.PubnubConfig = {
    subscribeKey: subscribekey,
    publishKey: publishkey,
    ssl: true,
  };
  const { setCaseSheetEdit, autoCloseCaseSheet } = useContext(CaseSheetContextJrd);

  useEffect(() => {
    if (autoCloseCaseSheet) {
      const text = {
        id: props.doctorId,
        isTyping: true,
        message: jdThankyou,
        automatedText:
          'Thank you ' +
          patientDetails!.firstName +
          ' ' +
          patientDetails!.lastName +
          '! ' +
          props.assignedDoctor.assignedDoctorDisplayName +
          ', will be with you at your booked consultation time.',
        messageDate: new Date(),
        sentBy: REQUEST_ROLES.JUNIOR,
      };
      pubnub.publish(
        {
          message: text,
          channel: channel,
          storeInHistory: true,
        },
        (status, response) => {}
      );
      unSubscribeBrowserButtonsListener();
    }
  }, [autoCloseCaseSheet]);

  useEffect(() => {
    const apptClosedTime = moment(new Date(props.appointmentDateTime));
    const presentTime = moment(new Date());
    apptClosedTime.diff(presentTime) > 0
      ? setDisableStartConsult(false)
      : setDisableStartConsult(true);
  }, [props.appointmentDateTime]);

  useEffect(() => {
    if (props.isEnded) {
      onStopConsult();
      setStartAppointment(!startAppointment);
      //setStartAppointmentButton(true);
    }
  }, [props.isEnded]);

  useEffect(() => {
    setTextOtherCancel;
    if (reason === 'Other') {
      setTextOther(true);
    } else {
      setTextOther(false);
    }
    clearOtherError();
  }, [reason]);
  useEffect(() => {
    if (cancelReason === 'Other') {
      setTextOtherCancel(true);
    } else {
      setTextOtherCancel(false);
    }
    clearError();
  }, [cancelReason]);

  const pubnub = new Pubnub(config);

  useEffect(() => {
    countdowntimer = setInterval(checkTimeRemainToConsult, 1000);
    pubnub.subscribe({
      channels: [channel],
      //withPresence: true,
    });
    pubnub.addListener({
      status: (statusEvent) => {},
      message: (message) => {
        if (
          !showVideoChat &&
          message.message.message !== videoCallMsg &&
          message.message.message !== audioCallMsg &&
          message.message.message !== stopcallMsg &&
          message.message.message !== acceptcallMsg &&
          message.message.message !== transferconsult &&
          message.message.message !== rescheduleconsult &&
          message.message.message !== followupconsult &&
          message.message.message !== patientConsultStarted &&
          message.message.message !== firstMessage &&
          message.message.message !== secondMessage &&
          message.message.message !== covertVideoMsg &&
          message.message.message !== covertAudioMsg &&
          message.message.message !== cancelConsultInitiated &&
          message.message.message !== callAbandonment &&
          message.message.message !== appointmentComplete
        ) {
          setIsNewMsg(true);
        } else {
          setIsNewMsg(false);
        }
        if (message.message && message.message.message === acceptcallMsg) {
          setIsCallAccepted(true);
        }
      },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
      clearInterval(countdowntimer);
    };
  }, []);

  const onStartConsult = () => {
    const text = {
      id: props.doctorId,
      message: startConsultjr,
      isTyping: true,
      automatedText:
        'Hi ' +
        patientDetails!.firstName +
        ' ' +
        patientDetails!.lastName +
        '! :) I am from ' +
        props.assignedDoctor.assignedDoctorDisplayName +
        "'s team. Sorry that you aren’t in the best state. We'll do our best to make things better. Let's get a few quick questions out of the way before " +
        props.assignedDoctor.assignedDoctorDisplayName +
        ' starts the consultation.',
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    subscribeBrowserButtonsListener();
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
    setTimeout(() => {
      const texts = {
        id: props.doctorId,
        message: languageQue,
        automatedText:
          'Before I go any further, would you be comfortable continuing to talk in English?',
        isTyping: true,
        messageDate: new Date(),
        sentBy: REQUEST_ROLES.JUNIOR,
      };
      pubnub.publish(
        {
          message: texts,
          channel: channel,
          storeInHistory: true,
        },
        (status, response) => {}
      );
    }, 2000);
  };
  const onStopConsult = () => {
    const text = {
      id: props.doctorId,
      message: stopConsultJr,
      isTyping: true,
      automatedText:
        'Thank you ' +
        patientDetails!.firstName +
        ' ' +
        patientDetails!.lastName +
        '! ' +
        props.assignedDoctor.assignedDoctorDisplayName +
        ', will be with you at your booked consultation time.',
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.JUNIOR,
    };
    unSubscribeBrowserButtonsListener();
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
  };

  const currentDoctor = useCurrentPatient();
  let isJuniorDoctor;
  let jrDoctorId;
  if (currentDoctor) {
    isJuniorDoctor = currentDoctor.doctorType === DoctorType.JUNIOR;
    jrDoctorId = currentDoctor.id;
  }
  const patientName = patientDetails
    ? patientDetails!.firstName + ' ' + patientDetails!.lastName
    : '';
  const mutationCancelJrdConsult = useMutation<CancelAppointment, CancelAppointmentVariables>(
    CANCEL_APPOINTMENT,
    {
      variables: {
        cancelAppointmentInput: {
          appointmentId: params.appointmentId,
          cancelReason: cancelReason === 'Other' ? otherTextCancelValue : cancelReason,
          cancelledBy: isJuniorDoctor ? REQUEST_ROLES.JUNIOR : REQUEST_ROLES.PATIENT,
          cancelledById: isJuniorDoctor ? jrDoctorId || '' : params.patientId,
        },
      },
    }
  );

  const mutationRemoveConsult = useMutation<
    RemoveFromConsultQueue,
    RemoveFromConsultQueueVariables
  >(REMOVE_FROM_CONSULT_QUEUE, {
    variables: {
      id: parseInt(params.queueId, 10),
    },
  });

  const cancelConsultAction = () => {
    if (isEmpty(cancelReason)) {
      setErrorState({
        ...errorState,
        reasonError: true,
        searchError: false,
        otherErrorCancel: false,
      });
    } else if (cancelReason === 'Other' && isEmpty(otherTextCancelValue)) {
      setErrorState({
        ...errorState,
        reasonError: false,
        searchError: false,
        otherErrorCancel: true,
      });
    } else {
      setErrorState({
        ...errorState,
        reasonError: false,
        searchError: false,
        otherErrorCancel: false,
      });
    }
  };

  const getTimerText = () => {
    const now = new Date();
    const diff = moment.duration(
      moment(new Date(props.appointmentDateTime)).diff(
        moment(moment(now).format('YYYY-MM-DD HH:mm:ss'))
      )
    );
    const diffInHours = diff.asHours();
    if (diffInHours > 0 && diffInHours < 12)
      if (diff.hours() <= 0) {
        return `| Time to consult ${
          diff.minutes().toString().length < 2 ? '0' + diff.minutes() : diff.minutes()
        } : ${diff.seconds().toString().length < 2 ? '0' + diff.seconds() : diff.seconds()}`;
      }
    return '';
  };
  return (
    <div>
      <div className={classes.pageSubHeader}>
        <div className={classes.headerLeftGroup}>
          <div className={classes.consultName}>
            Consult Room
            {appointmentInfo!.appointmentState === 'AWAITING_RESCHEDULE' ? (
              <div className={`${classes.consultDur} ${classes.consultDurShow}`}>
                This appointment is under reschedule and waiting for the patient to accept the new
                slot.
              </div>
            ) : remainingConsultStartTime <= 10 && remainingConsultStartTime > -1 ? (
              <div className={`${classes.consultDur} ${classes.consultDurShow}`}>
                {remainingConsultStartTime} minutes left for Senior Doctor to start the consult.
              </div>
            ) : (
              !props.hasCameraMicPermission && (
                <div className={`${classes.consultDur} ${classes.consultDurShow}`}>
                  Note: Please allow access to Camera & Mic.
                </div>
              )
            )}
          </div>

          {/* code commented as requested by the testing team
          ------------------------------------------------------------
           <div className={`${classes.consultDur} ${classes.consultDurShow}`}>
            {startAppointment
              ? `Consultation Duration ${
                  minutes.toString().length < 2 ? '0' + minutes : minutes
                } : ${seconds.toString().length < 2 ? '0' + seconds : seconds}`
              : getTimerText()}
          </div> */}
        </div>
        <div className={classes.headerRightGroup}>
          {startAppointment ? (
            <span>
              <AphButton
                classes={{
                  root: classes.saveBtn,
                  disabled: classes.saveBtnDisabled,
                }}
                disabled={props.saving}
                onClick={() => {
                  props.saveCasesheetAction(true, false);
                }}
              >
                Save
              </AphButton>
              <AphButton
                color="primary"
                className={classes.submitBtn}
                disabled={props.saving}
                onClick={() => {
                  unSubscribeBrowserButtonsListener();
                  stopInterval();
                  onStopConsult();
                  props.endConsultAction();
                  if (showVideo) {
                    stopAudioVideoCall();
                  }
                  setDisableOnCancel(true);
                }}
              >
                Submit Case Sheet
              </AphButton>
              {props.saving && (
                <span>
                  <CircularProgress className={classes.loading} />{' '}
                  <div className={classes.fadedBg}></div>
                </span>
              )}
            </span>
          ) : (
            <AphButton
              className={classes.consultButton}
              disabled={
                disableOnCancel ||
                (appointmentInfo!.appointmentState !== 'NEW' &&
                  appointmentInfo!.appointmentState !== 'RESCHEDULE') ||
                (appointmentInfo!.status !== STATUS.IN_PROGRESS &&
                  appointmentInfo!.status !== STATUS.PENDING)
              }
              onClick={() => {
                if (startAppointment) {
                  onStopConsult();
                  stopInterval();
                } else {
                  props.createSessionAction();
                }
                setCaseSheetEdit(true);
                setStartAppointment(!startAppointment);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#fff" d="M8 5v14l11-7z" />
              </svg>
              {startAppointment ? 'End Consult' : 'Start Consult'}
            </AphButton>
          )}
          <AphButton
            className={classes.iconButton}
            aria-describedby={id}
            disabled={
              disableOnCancel ||
              (appointmentInfo!.appointmentState !== 'NEW' &&
                appointmentInfo!.appointmentState !== 'RESCHEDULE') ||
              (appointmentInfo!.status !== STATUS.IN_PROGRESS &&
                appointmentInfo!.status !== STATUS.PENDING)
            }
            onClick={(e: any) => handleClick(e)}
          >
            <img src={require('images/ic_call.svg')} />
          </AphButton>
          <AphButton
            className={classes.iconButton}
            aria-describedby={idThreeDots}
            disabled={
              disableOnCancel ||
              (appointmentInfo!.appointmentState !== 'NEW' &&
                appointmentInfo!.appointmentState !== 'RESCHEDULE') ||
              (appointmentInfo!.status !== STATUS.IN_PROGRESS &&
                appointmentInfo!.status !== STATUS.PENDING)
            }
            onClick={(e: any) => handleClickThreeDots(e)}
          >
            <img src={require('images/ic_more.svg')} />
          </AphButton>
        </div>
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper className={classes.loginForm}>
          <Button className={classes.cross}>
            <img src={require('images/ic_cross.svg')} alt="" onClick={() => handleClose()} />
          </Button>
          <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
            <p>How do you want to talk to the patient?</p>
            <Button
              variant="contained"
              color="primary"
              className={classes.needHelp}
              onClick={() => {
                handleClose();
                props.isAudioVideoCallEnded(true);
                props.setStartConsultAction(false);
                setDisableOnCancel(true);
                autoSend(audioCallMsg);
                setIsVideoCall(false);
              }}
            >
              <img src={require('images/call_popup.svg')} alt="" />
              AUDIO CALL
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.needHelp}
              onClick={() => {
                handleClose();
                props.isAudioVideoCallEnded(true);
                props.setStartConsultAction(true);
                setDisableOnCancel(true);
                autoSend(videoCallMsg);
                setIsVideoCall(true);
              }}
            >
              <img src={require('images/video_popup.svg')} alt="" />
              VIDEO CALL
            </Button>
          </div>
        </Paper>
      </Popover>
      <Popover
        id={idThreeDots}
        classes={{ paper: classes.consultMenuPopover }}
        open={openThreeDots}
        anchorEl={anchorElThreeDots}
        onClose={handleCloseThreeDots}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div
          onClick={() => {
            if (
              appointmentInfo!.status === STATUS.PENDING ||
              appointmentInfo!.status === STATUS.IN_PROGRESS
            ) {
              handleCloseThreeDots();
              setIsCancelPopoverOpen(true);
            } else {
              alert('You are not allowed to cancel the appointment');
            }
          }}
          className={classes.menuBtnGroup}
        >
          <AphButton>End or Cancel Consult</AphButton>
        </div>
      </Popover>
      <Modal
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBox}>
          <div className={classes.tabHeader}>
            <h4>RESCHEDULE CONSULT</h4>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setIsPopoverOpen(false)}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            <p>Why do you want to reschedule this consult?</p>

            <AphSelect
              value={reason}
              MenuProps={{
                classes: { paper: classes.menuPopover },
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }}
              onChange={(e: any) => {
                setReason(e.target.value as string);
              }}
            >
              <MenuItem
                value="I am running late from previous consult"
                classes={{ selected: classes.menuSelected }}
              >
                I am running late from previous consult
              </MenuItem>
              <MenuItem
                value="I have personal engagement"
                classes={{ selected: classes.menuSelected }}
              >
                I have personal engagement
              </MenuItem>
              <MenuItem
                value="I have a parallel appointment/ procedure"
                classes={{ selected: classes.menuSelected }}
              >
                I have a parallel appointment/ procedure
              </MenuItem>
              <MenuItem
                value="Patient was not reachable"
                classes={{ selected: classes.menuSelected }}
              >
                Patient was not reachable
              </MenuItem>
              <MenuItem value="Other" classes={{ selected: classes.menuSelected }}>
                Other
              </MenuItem>
            </AphSelect>
            {textOther && (
              <div className={classes.othercases}>
                <AphTextField
                  classes={{ root: classes.searchInput }}
                  placeholder="Enter here...."
                  onChange={(e: any) => {
                    setOtherTextValue(e.target.value);
                  }}
                  value={otherTextValue}
                  error={errorStateReshedule.otherError}
                />
                {errorStateReshedule.otherError && (
                  <FormHelperText
                    className={classes.helpText}
                    component="div"
                    error={errorStateReshedule.otherError}
                  >
                    Please write other reason
                  </FormHelperText>
                )}
              </div>
            )}
          </div>
          <div className={classes.tabFooter}>
            <Button
              className={classes.cancelConsult}
              onClick={() => {
                setIsPopoverOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button className={classes.ResheduleCosultButton}>Reschedule Consult</Button>
          </div>
        </Paper>
      </Modal>

      <Modal
        open={isCancelPopoverOpen}
        onClose={() => {
          setIsCancelPopoverOpen(false);
          setCancelError(null);
        }}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBoxCancel}>
          <div className={classes.tabHeader}>
            <h4>Cancel CONSULT</h4>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => {
                  setIsCancelPopoverOpen(false);
                  setCancelError(null);
                }}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            <p>Why do you want to cancel this consult?</p>

            <AphSelect
              value={cancelReason}
              placeholder="Select a reason"
              MenuProps={{
                classes: { paper: classes.menuPopover },
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }}
              onChange={(e: any) => {
                setCancelReason(e.target.value as string);
              }}
              error={errorState.reasonError}
            >
              <MenuItem
                value="Not related to my specialty"
                classes={{ selected: classes.menuSelected }}
              >
                Not related to my specialty
              </MenuItem>
              <MenuItem
                value="Needs a second opinion from a senior specialist"
                classes={{ selected: classes.menuSelected }}
              >
                Needs a second opinion from a senior specialist
              </MenuItem>
              <MenuItem
                value="Patient requested for a slot when I am not available"
                classes={{ selected: classes.menuSelected }}
              >
                Patient requested for a slot when I am not available
              </MenuItem>
              <MenuItem
                value="Patient needs a in person visit"
                classes={{ selected: classes.menuSelected }}
              >
                Patient needs a in person visit
              </MenuItem>
              <MenuItem value="Other" classes={{ selected: classes.menuSelected }}>
                Other
              </MenuItem>
            </AphSelect>
            {errorState.reasonError && (
              <FormHelperText
                className={classes.helpText}
                component="div"
                error={errorState.reasonError}
              >
                Please select reason
              </FormHelperText>
            )}
            {textOtherCancel && (
              <div>
                <AphTextField
                  classes={{ root: classes.searchInput }}
                  placeholder="Enter here...."
                  onChange={(e: any) => {
                    setOtherTextCancelValue(e.target.value);
                  }}
                  value={otherTextCancelValue}
                  error={errorState.otherErrorCancel}
                />
                {errorState.otherErrorCancel && (
                  <FormHelperText
                    className={classes.helpText}
                    component="div"
                    error={errorState.otherErrorCancel}
                  >
                    Please write other reason
                  </FormHelperText>
                )}
              </div>
            )}
          </div>
          {cancelError && <div className={classes.cancelConsultError}>{cancelError}</div>}
          <div className={classes.tabFooter}>
            <Button
              className={classes.ResheduleCosultButton}
              disabled={textOtherCancel && otherTextCancelValue === ''}
              onClick={() => {
                mutationCancelJrdConsult()
                  .then((res: any) => {
                    if (showVideo) {
                      stopAudioVideoCall();
                    }
                    setIsCancelPopoverOpen(false);
                    cancelConsultAction();
                    mutationRemoveConsult()
                      .then(() => {})
                      .catch((e: ApolloError) => {
                        const logObject = {
                          api: 'RemoveFromConsultQueue',
                          inputParam: JSON.stringify({
                            id: parseInt(params.queueId, 10),
                          }),
                          appointmentId: params.appointmentId,
                          doctorId: currentDoctor!.id,
                          doctorDisplayName: currentDoctor!.displayName,
                          patientId: params.patientId,
                          patientName: patientName,
                          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                          appointmentDateTime: props.appointmentDateTime
                            ? moment(new Date(props.appointmentDateTime)).format(
                                'MMMM DD YYYY h:mm:ss a'
                              )
                            : '',
                          error: JSON.stringify(e),
                        };

                        sessionClient.notify(JSON.stringify(logObject));
                      });
                    const text = {
                      id: props.doctorId,
                      message: cancelConsultInitiated,
                      isTyping: true,
                      messageDate: new Date(),
                      sentBy: REQUEST_ROLES.JUNIOR,
                    };
                    pubnub.publish(
                      {
                        message: text,
                        channel: channel,
                        storeInHistory: true,
                      },
                      (status: any, response: any) => {
                        if (document.getElementById('homeId')) {
                          document.getElementById('homeId')!.click();
                        }
                      }
                    );

                    //window.location.href = clientRoutes.juniorDoctor();
                  })
                  .catch((e: ApolloError) => {
                    const logObject = {
                      api: 'CancelAppointment',
                      inputParam: JSON.stringify({
                        appointmentId: params.appointmentId,
                        cancelReason:
                          cancelReason === 'Other' ? otherTextCancelValue : cancelReason,
                        cancelledBy: REQUEST_ROLES.JUNIOR,
                        cancelledById: currentDoctor!.id,
                      }),
                      appointmentId: params.appointmentId,
                      doctorId: currentDoctor!.id,
                      doctorDisplayName: currentDoctor!.displayName,
                      patientId: params.patientId,
                      patientName: patientName,
                      currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                      appointmentDateTime: props.appointmentDateTime
                        ? moment(new Date(props.appointmentDateTime)).format(
                            'MMMM DD YYYY h:mm:ss a'
                          )
                        : '',
                      error: JSON.stringify(e),
                    };

                    sessionClient.notify(JSON.stringify(logObject));
                    setCancelError(e.graphQLErrors[0].message);
                  });
              }}
            >
              Cancel Consult
            </Button>
          </div>
        </Paper>
      </Modal>
      {/* audio/video start*/}
      <div className={classes.posRelative}>
        <div className={showVideo ? '' : classes.audioVideoContainer}>
          {showVideo && (
            <JDConsult
              toggelChatVideo={() => toggelChatVideo()}
              stopAudioVideoCall={() => stopAudioVideoCall()}
              stopAudioVideoCallpatient={() => stopAudioVideoCallpatient()}
              showVideoChat={showVideoChat}
              isVideoCall={isVideoCall}
              sessionId={props.sessionId}
              token={props.token}
              timerMinuts={timerMinuts}
              timerSeconds={timerSeconds}
              isCallAccepted={isCallAccepted}
              isNewMsg={isNewMsg}
              convertCall={() => convertCall()}
              JDPhotoUrl={currentPatient && currentPatient.photoUrl ? currentPatient.photoUrl : ''}
            />
          )}
        </div>
        {/* audio/video end*/}
      </div>
    </div>
  );
};
