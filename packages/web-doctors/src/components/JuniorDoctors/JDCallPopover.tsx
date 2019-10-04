import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Button,
  Modal,
  MenuItem,
  InputBase,
  Popover,
  Paper,
  FormHelperText,
} from '@material-ui/core';
import Pubnub from 'pubnub';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { AphSelect, AphTextField, AphButton } from '@aph/web-ui-components';
import { useAuth } from 'hooks/authHooks';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useApolloClient } from 'react-apollo-hooks';
import {
  InitiateTransferAppointment,
  InitiateTransferAppointmentVariables,
} from 'graphql/types/InitiateTransferAppointment';
import {
  SearchDoctorAndSpecialtyByName,
  SearchDoctorAndSpecialtyByNameVariables,
} from 'graphql/types/SearchDoctorAndSpecialtyByName';
import {
  INITIATE_TRANSFER_APPONITMENT,
  SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
} from 'graphql/profiles';
import { TRANSFER_INITIATED_TYPE, STATUS } from 'graphql/types/globalTypes';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { JDConsult } from 'components/JuniorDoctors/JDConsult';
import { CircularProgress } from '@material-ui/core';

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
      backgroundColor: '#890000',
      marginLeft: 20,
      minWidth: 168,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#890000',
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
      top: '10px',
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
      // width: 300,
      // minHeight: 50,
      padding: 0,
      borderRadius: 0,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      // backgroundColor: theme.palette.common.white,
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
    modalBoxTransfer: {
      maxWidth: 480,
      minHeight: 515,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
      position: 'relative',
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
        padding: '15px',
      },
    },
    tabFooter: {
      background: 'white',
      position: 'absolute',
      height: 60,
      paddingTop: '10px',
      borderBottomLeftRadius: '10px',
      borderBottomRightRadius: '10px',
      width: '480px',
      bottom: '0px',
      textAlign: 'right',
      paddingRight: '20px',
    },
    tabBody: {
      background: 'white',
      minHeight: 80,
      marginTop: 10,
      padding: '10px 15px 15px 15px',
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
          // borderBottom: '1px solid rgba(1,71,91,0.2)',
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
      textTransform: 'uppercase',
    },
    consultDur: {
      fontSize: 12,
      fontWeight: 500,
      borderLeft: 'solid 1px rgba(2, 71, 91, 0.6)',
      paddingLeft: 12,
      marginLeft: 12,
      display: 'none',
      color: 'rgba(2, 71, 91, 0.6)',
      '& span': {
        fontWeight: 'bold',
      },
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
  otherErrorTransfer: boolean;
}
interface errorObjectReshedule {
  otherError: boolean;
}
interface CallPopoverProps {
  setStartConsultAction(isVideo: boolean): void;
  createSessionAction: () => void;
  saveCasesheetAction: (onlySave: boolean) => void;
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
  assignedDoctorSalutation: string;
  assignedDoctorFirstName: string;
  assignedDoctorLastName: string;
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

export const JDCallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles();
  const { appointmentInfo, patientDetails } = useContext(CaseSheetContextJrd);
  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';
  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const stopcallMsg = '^^callme`stop^^';
  const acceptcallMsg = '^^callme`accept^^';
  const startConsult = '^^#startconsult';
  const startConsultjr = '^^#startconsultJr';
  const stopConsult = '^^#stopconsult';
  const transferconsult = '^^#transferconsult';
  const rescheduleconsult = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);

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
  const [startAppointmentButton, setStartAppointmentButton] = React.useState<boolean>(true);
  const [disableOnTransfer, setDisableOnTransfer] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isTransferPopoverOpen, setIsTransferPopoverOpen] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('I am running late from previous consult');
  const [transferReason, setTransferReason] = useState<string>('Not related to my specialty');
  const [textOther, setTextOther] = useState(false);
  const [otherTextValue, setOtherTextValue] = useState('');
  const [textOtherTransfer, setTextOtherTransfer] = useState(false);
  const [otherTextTransferValue, setOtherTextTansferValue] = useState('');
  const [searchKeyWord, setSearchKeyword] = React.useState('');
  const [noteKeyword, setNoteKeyword] = React.useState('');
  const [isDoctorOrSpeciality, setIsDoctorOrSpeciality] = useState(false);
  const [filteredStarDoctors, setFilteredStarDoctors] = useState<any>([]);
  const [filterSpeciality, setFilterSpeciality] = useState<any>([]);
  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();
  const [anchorElThreeDots, setAnchorElThreeDots] = React.useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>('');
  const [errorState, setErrorState] = React.useState<errorObject>({
    reasonError: false,
    searchError: false,
    otherErrorTransfer: false,
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
    //srollToBottomAction();
  };
  const stopIntervalTimer = () => {
    setStartingTime(0);
    timerIntervalId && clearInterval(timerIntervalId);
  };
  const [disableStartConsult, setDisableStartConsult] = useState<boolean>(false);
  useEffect(() => {
    if (isCallAccepted) {
      startIntervalTimer(0);
    }
  }, [isCallAccepted]);
  const stopAudioVideoCall = () => {
    setIsCallAccepted(false);
    setShowVideo(false);
    setShowVideoChat(false);
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const text = {
      id: props.doctorId,
      message: stopcallMsg,
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
        //setMessageText('');
      }
    );
    const stoptext = {
      id: props.doctorId,
      //message: `Audio call ended`,
      message: `${isVideoCall ? 'Video' : 'Audio'} call ended`,
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds}`,
      //duration: `10:00`,
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
        //setMessageText('');
      }
    );
    stopIntervalTimer();
    //setIsVideoCall(false);
  };
  const autoSend = (callType: string) => {
    const text = {
      id: props.doctorId,
      message: callType,
      // props.startConsult === 'videocall' ? videoCallMsg : audioCallMsg,
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
        //setMessageText('');
      }
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
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        //setMessageText('');
      }
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
      otherErrorTransfer: false,
    });
  };
  const clearOtherError = () => {
    setErrorStateReshedule({
      ...errorStateReshedule,
      otherError: false,
    });
  };
  const clearTransferField = () => {
    setSelectedDoctor('');
    setSearchKeyword('');
    setTransferReason('');
    clearError();
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
  const startConstultCheck = () => {
    const disablecurrent = new Date();
    const disableconsult = new Date(props.appointmentDateTime);
    const disableyear = disableconsult.getFullYear();
    const disablemonth = disableconsult.getMonth() + 1;
    const disableday = disableconsult.getDate();
    let disablehour = disableconsult.getHours();
    let disableminute = disableconsult.getMinutes() + 15;
    const minusTime = new Date(disableconsult.getTime() - 15 * 60000);
    const disablesecond = disableconsult.getSeconds();
    if (disableminute > 59) {
      const disablediff = disableminute - 60;
      disablehour = disablehour + 1;
      if (disablehour === 24) {
        disablehour = 0;
      }
      disableminute = disablediff;
    }
    const disableaddedMinutes =
      disableyear +
      '-' +
      disablemonth +
      '-' +
      disableday +
      ' ' +
      disablehour +
      ':' +
      disableminute +
      ':' +
      disablesecond;
    const disableaddedTime = new Date(disableaddedMinutes);
    if (
      disablecurrent >= minusTime &&
      disableaddedTime >= disablecurrent &&
      localStorage.getItem('loggedInMobileNumber') !== currentPatient!.delegateNumber
    ) {
      setStartAppointmentButton(false);
    } else {
      setStartAppointmentButton(true);
    }
  };
  const client = useApolloClient();
  const doctorSpeciality = (searchText: string) => {
    client
      .query<SearchDoctorAndSpecialtyByName, SearchDoctorAndSpecialtyByNameVariables>({
        query: SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
        variables: { searchText: searchText },
      })
      .then((_data) => {
        setFilteredStarDoctors(_data.data.SearchDoctorAndSpecialtyByName!.doctors);
        setFilterSpeciality(_data.data.SearchDoctorAndSpecialtyByName!.specialties);
        if (
          _data!.data!.SearchDoctorAndSpecialtyByName!.doctors!.length > 0 ||
          _data!.data!.SearchDoctorAndSpecialtyByName!.specialties!.length > 0
        ) {
          setIsDoctorOrSpeciality(true);
        }
      })
      .catch((e) => {
        console.log('Error occured while searching for Doctors', e);
      });
  };
  const handleSpecialityClick = (value: any) => {
    setIsDoctorOrSpeciality(false);
    setSearchKeyword(value.name);
    setSelectedDoctor(value.name);
    transferObject = {
      appointmentId: props.appointmentId,
      transferDateTime: '',
      photoUrl: value.image,
      doctorId: '',
      specialtyId: value.id,
      doctorName: '',
      experience: '',
      specilty: value.name,
      facilityId: '',
      transferId: '',
    };
    clearError();
  };
  const handleDoctorClick = (value: any) => {
    setIsDoctorOrSpeciality(false);
    setSearchKeyword(value.firstName + ' ' + value.lastName);
    setSelectedDoctor(value.firstName + ' ' + value.lastName);
    transferObject = {
      appointmentId: props.appointmentId,
      transferDateTime: '',
      photoUrl: value.photoUrl,
      doctorId: value.id,
      specialtyId: value.specialty.id,
      doctorName: value.firstName + ' ' + value.lastName,
      experience: value.experience,
      specilty: value.specialty.name,
      facilityId: value!.doctorHospital[0]!.facility.id,
      transferId: '',
    };
    clearError();
  };
  setInterval(startConstultCheck, 1000);
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
    if (autoCloseCaseSheet) unSubscribeBrowserButtonsListener();
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
      setStartAppointmentButton(true);
    }
  }, [props.isEnded]);

  useEffect(() => {
    setTextOtherTransfer;
    if (reason === 'Other') {
      setTextOther(true);
    } else {
      setTextOther(false);
    }
    clearOtherError();
  }, [reason]);
  useEffect(() => {
    if (transferReason === 'Other') {
      setTextOtherTransfer(true);
    } else {
      setTextOtherTransfer(false);
    }
    clearError();
  }, [transferReason]);
  const pubnub = new Pubnub(config);

  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
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
          message.message.message !== followupconsult
        ) {
          setIsNewMsg(true);
        }
        if (message.message && message.message.message === acceptcallMsg) {
          setIsCallAccepted(true);
        }
      },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, []);

  const onStartConsult = () => {
    const text = {
      id: props.doctorId,
      //message: startConsult,
      message: startConsultjr,
      isTyping: true,
      automatedText:
        'Hi ' +
        patientDetails!.firstName +
        ' ' +
        patientDetails!.lastName +
        '! :) I am from Dr. ' +
        props.assignedDoctorFirstName +
        ' ' +
        props.assignedDoctorLastName +
        "'s team. Sorry that you aren’t in the best state. We'll do our best to make things better. Let's get a few quick questions out of the way before Dr. " +
        props.assignedDoctorFirstName +
        ' ' +
        props!.assignedDoctorLastName +
        ' starts the consultation.',
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
  };
  const onStopConsult = () => {
    const text = {
      id: props.doctorId,
      message: stopConsult,
      isTyping: true,
      automatedText:
        'Thank you ' +
        patientDetails!.firstName +
        ' ' +
        patientDetails!.lastName +
        ', I have everything I need. I will share these details with Dr. ' +
        props.assignedDoctorFirstName +
        ' ' +
        props.assignedDoctorLastName +
        ', who will be here with you soon.',
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

    // let folloupDateTime = '';
    // if (
    //   followUpDate &&
    //   followUpDate.length > 0 &&
    //   followUpDate[0] !== null &&
    //   followUpDate[0] !== ''
    // ) {
    //   folloupDateTime = followUpDate[0] ? new Date(followUpDate[0]).toISOString() : '';
    // } else if (followUp[0] && followUpAfterInDays[0] !== 'Custom') {
    //   const apptdateTime = new Date(props.appointmentDateTime);
    //   folloupDateTime = new Date(
    //     apptdateTime.getTime() + parseInt(followUpAfterInDays[0]) * 24 * 60 * 60 * 1000
    //   ).toISOString();
    // }
    // const followupObj: any = {
    //   appointmentId: props.appointmentId,
    //   folloupDateTime: folloupDateTime,
    //   doctorId: props.doctorId,
    //   caseSheetId: props.caseSheetId,
    //   doctorInfo: currentPatient,
    //   pdfUrl: props.prescriptionPdf,
    // };
    // if (folloupDateTime !== '') {
    //   setTimeout(() => {
    //     pubnub.publish(
    //       {
    //         message: {
    //           id: props.doctorId,
    //           message: followupconsult,
    //           transferInfo: followupObj,
    //         },
    //         channel: channel,
    //         storeInHistory: true,
    //       },
    //       (status, response) => {}
    //     );
    //   }, 100);
    // }
  };
  const transferConsultAction = () => {
    if (isEmpty(transferReason)) {
      setErrorState({
        ...errorState,
        reasonError: true,
        searchError: false,
        otherErrorTransfer: false,
      });
    } else if (transferReason === 'Other' && isEmpty(otherTextTransferValue)) {
      setErrorState({
        ...errorState,
        reasonError: false,
        searchError: false,
        otherErrorTransfer: true,
      });
    } else if (isEmpty(selectedDoctor)) {
      setErrorState({
        ...errorState,
        reasonError: false,
        searchError: true,
        otherErrorTransfer: false,
      });
    } else {
      setErrorState({
        ...errorState,
        reasonError: false,
        searchError: false,
        otherErrorTransfer: false,
      });
      client
        .mutate<InitiateTransferAppointment, InitiateTransferAppointmentVariables>({
          mutation: INITIATE_TRANSFER_APPONITMENT,
          variables: {
            TransferAppointmentInput: {
              appointmentId: props.appointmentId,
              transferInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
              transferInitiatedId: props.doctorId,
              transferredDoctorId: transferObject.doctorId,
              transferredSpecialtyId: transferObject.specialtyId,
              transferReason: transferReason === 'Other' ? otherTextTransferValue : transferReason,
              transferNotes: noteKeyword,
            },
          },
        })
        .then((_data: any) => {
          transferObject.transferDateTime = _data!.data!.initiateTransferAppointment!.doctorNextSlot;
          transferObject.transferId = _data!.data!.initiateTransferAppointment!.transferAppointment!.id;
          console.log(transferObject);
          pubnub.publish(
            {
              message: {
                id: props.doctorId,
                message: transferconsult,
                transferInfo: transferObject,
              },
              channel: channel,
              storeInHistory: true,
            },
            (status, response) => {}
          );
          clearTransferField();
          setIsTransferPopoverOpen(false);
          setDisableOnTransfer(true);
        })
        .catch((e: any) => {
          console.log('Error occured while searching for Initiate transfer apppointment', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log(
            'Error occured while searching for Initiate transfer apppointment',
            errorMessage,
            error
          );
          alert(errorMessage);
        });
    }
  };
  const rescheduleConsultAction = () => {
    console.log('reschedule not available');
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
  const [isDoctorSelected, setIsDoctorSelected] = useState(false);
  return (
    <div>
      <div className={classes.pageSubHeader}>
        <div className={classes.headerLeftGroup}>
          <div className={classes.consultName}>Consult Room</div>
          <div className={classes.consultDur}>
            {startAppointment
              ? `Consultation Duration ${
                  minutes.toString().length < 2 ? '0' + minutes : minutes
                } : ${seconds.toString().length < 2 ? '0' + seconds : seconds}`
              : getTimerText()}
          </div>
        </div>
        <div className={classes.headerRightGroup}>
          {startAppointment ? (
            <span>
              <AphButton
                classes={{ root: classes.saveBtn, disabled: classes.saveBtnDisabled }}
                disabled={props.saving}
                onClick={() => {
                  props.saveCasesheetAction(true);
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
                  setDisableOnTransfer(true);
                }}
              >
                Submit Case Sheet
              </AphButton>
              {props.saving && <CircularProgress className={classes.loading} />} }
            </span>
          ) : (
            <AphButton
              className={classes.consultButton}
              //disabled={disableStartConsult}
              onClick={() => {
                !startAppointment ? onStartConsult() : onStopConsult();
                !startAppointment ? startInterval(900) : stopInterval();
                setStartAppointment(!startAppointment);
                props.createSessionAction();
                setCaseSheetEdit(true);
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
            onClick={(e: any) => handleClick(e)}
          >
            <img src={require('images/ic_call.svg')} />
          </AphButton>
          <AphButton
            className={classes.iconButton}
            aria-describedby={idThreeDots}
            disabled={
              // startAppointmentButton ||
              disableOnTransfer ||
              appointmentInfo!.appointmentState !== 'NEW' ||
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
                props.setStartConsultAction(false);
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
                props.setStartConsultAction(true);
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
              setIsTransferPopoverOpen(true);
            } else {
              alert('You are not allowed to transfer the appointment');
            }
          }}
          className={classes.menuBtnGroup}
        >
          <AphButton>Transfer Consult</AphButton>
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
            <Button
              className={classes.ResheduleCosultButton}
              onClick={() => {
                rescheduleConsultAction();
              }}
            >
              Reschedule Consult
            </Button>
          </div>
        </Paper>
      </Modal>
      <Modal
        open={isTransferPopoverOpen}
        onClose={() => setIsTransferPopoverOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBoxTransfer}>
          <div className={classes.tabHeader}>
            <h4>TRANSFER CONSULT</h4>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => {
                  setIsTransferPopoverOpen(false);
                }}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            <p>Why do you want to transfer this consult?</p>

            <AphSelect
              value={transferReason}
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
                setTransferReason(e.target.value as string);
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
            {textOtherTransfer && (
              <div>
                <AphTextField
                  classes={{ root: classes.searchInput }}
                  placeholder="Enter here...."
                  onChange={(e: any) => {
                    setOtherTextTansferValue(e.target.value);
                  }}
                  value={otherTextTransferValue}
                  error={errorState.otherErrorTransfer}
                />
                {errorState.otherErrorTransfer && (
                  <FormHelperText
                    className={classes.helpText}
                    component="div"
                    error={errorState.otherErrorTransfer}
                  >
                    Please write other reason
                  </FormHelperText>
                )}
              </div>
            )}
          </div>
          <div className={classes.tabBody}>
            <p>Whom do you want to transfer this consult to?</p>
            <AphTextField
              classes={{ root: classes.searchInput }}
              placeholder="Search for Doctor/Speciality"
              onChange={(e: any) => {
                setIsDoctorSelected(false);
                setSearchKeyword(e.target.value);
                if (e.target.value.length > 1) {
                  doctorSpeciality(e.target.value);
                }
                setSelectedDoctor('');
                clearError();
              }}
              value={searchKeyWord}
              error={errorState.searchError}
            />
            {errorState.searchError && (
              <FormHelperText
                className={classes.helpText}
                component="div"
                error={errorState.searchError}
              >
                Please select doctor or speciality
              </FormHelperText>
            )}
            {isDoctorOrSpeciality && searchKeyWord.length > 1 && (
              <span className={classes.doctorSearch}>
                <h6>Doctor(s)</h6>
                {filteredStarDoctors!.length > 0 ? (
                  <ul>
                    {filteredStarDoctors!.map((item: any, idx: any) => (
                      <li
                        key={idx}
                        onClick={() => {
                          handleDoctorClick(item);
                          setIsDoctorSelected(true);
                        }}
                      >
                        {props.doctorId !== item.id &&
                          `${item.salutation.charAt(0).toUpperCase()}${item.salutation
                            .slice(1)
                            .toLowerCase()}. ${item.firstName} ${item.lastName}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No Doctors found'
                )}
                <h6> Speciality(s)</h6>
                {filterSpeciality!.length > 0 ? (
                  <ul>
                    {filterSpeciality!.map((item: any, idx: any) => (
                      <li
                        key={idx}
                        onClick={() => {
                          handleSpecialityClick(item);
                          setIsDoctorSelected(true);
                        }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No Speciality found'
                )}
              </span>
            )}
          </div>
          <div className={classes.tabBody}>
            <p>Add a Note (optional)</p>
            <InputBase
              fullWidth
              className={classes.textFieldColor}
              placeholder="Enter here.."
              onChange={(e) => {
                setNoteKeyword(e.target.value);
              }}
              value={noteKeyword}
            />
          </div>
          <div className={classes.tabFooter}>
            <Button
              className={classes.cancelConsult}
              onClick={() => {
                setIsTransferPopoverOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className={classes.ResheduleCosultButton}
              disabled={(textOtherTransfer && otherTextTransferValue === '') || !isDoctorSelected}
              onClick={() => {
                //setIsTransferPopoverOpen(false);
                //resheduleCosult();
                transferConsultAction();
              }}
            >
              Transfer Consult
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
            />
          )}
        </div>
        {/* audio/video end*/}
      </div>
    </div>
  );
};
