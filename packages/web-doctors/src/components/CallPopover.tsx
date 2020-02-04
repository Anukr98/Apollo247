import React, { useState, useRef, Fragment, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Button,
  Modal,
  MenuItem,
  Popover,
  Paper,
  FormHelperText,
  Typography,
} from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { Prompt, Link } from 'react-router-dom';
import moment from 'moment';
import { createMuiTheme } from '@material-ui/core';
import { isEmpty } from 'lodash';
import { AphSelect, AphTextField, AphButton } from '@aph/web-ui-components';
import { useAuth, useCurrentPatient } from 'hooks/authHooks';
import { ApolloError } from 'apollo-client';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useApolloClient, useMutation } from 'react-apollo-hooks';
import { useParams } from 'hooks/routerHooks';
import { CANCEL_APPOINTMENT } from 'graphql/profiles';
import { CancelAppointment, CancelAppointmentVariables } from 'graphql/types/CancelAppointment';
import { Consult } from 'components/Consult';
import { CircularProgress } from '@material-ui/core';

import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from 'graphql/types/EndAppointmentSession';
import { INITIATE_RESCHDULE_APPONITMENT, END_APPOINTMENT_SESSION } from 'graphql/profiles';
import {
  REQUEST_ROLES,
  TRANSFER_INITIATED_TYPE,
  STATUS,
  DoctorType,
} from 'graphql/types/globalTypes';
import * as _ from 'lodash';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { clientRoutes } from 'helpers/clientRoutes';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { GET_DOCTOR_NEXT_AVAILABILITY, GET_DOCTOR_AVAILABLE_SLOTS } from 'graphql/doctors';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { format } from 'date-fns';
import { AvailableSlots } from '../components/AvailableSlots';

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
      margin: theme.spacing(1, 1, 0, 0),
      backgroundColor: '#fc9916',
      marginLeft: 20,
      minWidth: 168,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      marginTop: 0,
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
      marginRight: 10,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
      '& svg': {
        marginRight: 5,
      },
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

    BackCosultButton: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fc9916',
      padding: '8px 16px',
      backgroundColor: '#fff',
      minWidth: 100,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      position: 'absolute',
      left: 20,
      '&:hover': {
        backgroundColor: '#fff',
      },
      '&:disabled': {
        color: 'rgba(252,153,22,0.3)',
      },
    },
    cancelConsult: {
      minWidth: 120,
      fontSize: 14,
      padding: '8px 16px',
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(1, 1, 0, 0),
      marginTop: 0,
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
      display: 'none',
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
      top: 8,
      fontSize: 18,
      color: '#02475b',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      backgroundColor: '#f7f7f7',
      paddingBottom: 95,
    },
    loading: {
      position: 'absolute',
      left: '-20%',
      top: 250,
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
        backgroundColor: 'transparent',
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
      '&:disabled': {
        color: '#fc9916',
        opacity: 0.7,
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
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      padding: 6,
    },
    modalBox: {
      maxWidth: 380,
      minHeight: 420,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
      position: 'relative',
    },
    modalBoxTabs: {
      maxWidth: 680,
      minHeight: 440,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#eeeeee',
      position: 'relative',
    },
    modalBoxConsult: {
      maxWidth: 480,
      minHeight: 260,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: '#fff',
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
        textTransform: 'uppercase',
        padding: '17px 20px',
      },
    },
    tabFooter: {
      background: 'white',
      position: 'absolute',
      borderBottomLeftRadius: '10px',
      borderBottomRightRadius: '10px',
      width: '100%',
      bottom: '0px',
      textAlign: 'right',
      padding: '16px 20px',
    },
    tabBody: {
      background: 'white',
      minHeight: 80,
      margin: 20,
      borderRadius: 5,
      padding: '10px 15px 15px 15px',
      '& h3': {
        fontSize: 18,
        color: '#02475b',
      },
      '& p': {
        margin: 0,
        fontSize: '15px',
        fontWeight: 500,
        lineHeight: 1.2,
        color: '#01475b',
        paddingBottom: 5,
        paddingTop: 4,
      },
    },
    tabbodyothers: {
      paddingBottom: 10,
      marginBottom: 50,
    },
    tabBodypadding: {
      margin: '0 20px',
      padding: '0 15px 15px 15px',
    },
    tabBodyTabs: {
      backgroundColor: 'transparent',
      margin: 8,
      padding: 8,
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
    selectText: {
      position: 'absolute',
      marginTop: 17,
      color: '#01475b',
      opacity: 0.7,
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
        paddingRight: 10,
        '& :before': {
          border: 0,
        },
      },
    },
    doctorSearch: {
      display: 'block',
      padding: 10,
      zIndex: 9,
      color: '#02475b',
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
        '& span': {
          color: 'rgba(0, 0, 0, 0.87)',
          zIndex: 9,
          fontSize: '14px',
          fontWeight: 'normal',
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
    stickyHeader: {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      backgroundColor: '#f7f7f7',
      boxShadow: 'inset 0px 0px 10px 0 rgba(128,128,128,0.2)',
    },
    prescriptionSent: {
      position: 'relative',
      top: 4,
      right: 15,
    },
    KeyboardDatePicker: {
      width: '100%',
      color: '#02475b !important',
      '& label': {
        color: '#02475b !important',
      },
      '& svg': {
        fill: '#02475b',
      },
      '& div': {
        '&:before': {
          borderBottom: '2px solid #00b38e !important',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e !important',
        },
      },
      '& input': {
        fontSize: 18,
        color: '#01475b',
        borderBottom: '2px solid #00b38e',
        fontWeight: 500,
      },
    },
    timepicker: {
      margin: '10px 20px 10px 0',
      width: '100%',
      borderBottom: '2px solid #00b38e',
      '&:hover': {
        borderBottom: '2px solid #00b38e',
      },
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: '95%',
      '& div': {
        color: '#01475b',
        fontSize: 15,
        lineHeight: 20,
        fontWeight: 500,
        borderBottom: '1px solid rgba(2,71,91,0.2)',
      },
      '& :before': {
        borderBottom: 'none',
      },
      '& :after': {
        borderBottom: 'none',
      },
      // '& :hover': {
      //   borderBottom: 'none',
      // },
    },
    suggestSlot: {
      textAlign: 'right',
      fontSize: 14,
      fontWeight: 500,
      color: '#fc9916',
      width: '100%',
      paddingTop: 0,
      paddingBottom: 0,
      boxShadow: 'none',
      '& span': {
        display: 'inline-block',
        textAlign: 'right',
      },
    },
    consultGroup: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      padding: 16,
      marginTop: 10,
      marginBottom: 10,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      borderRadius: 10,
      '& p': {
        marginTop: 0,
      },
    },
    scheduleCalendar: {
      // display: 'none',
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
      backgroundColor: '#fff',
    },
    scheduleTimeSlots: {
      // display: 'none',
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
      backgroundColor: '#fff',
    },
    showCalendar: {
      display: 'inline-block',
    },
    showTimeSlot: {
      display: 'inline-block',
      paddingTop: 0,
    },
    modalPopup: {
      '& div': {
        '&:focus': {
          outline: 'none',
        },
      },
    },
    dateField: {
      borderBottom: '1px solid rgba(2,71,91,0.02)',
      paddingBottom: 10,
      paddingTop: 15,
      fontSize: 15,
      color: '#01475b',
      fontWeight: 500,
      marginBottom: 15,
    },
    dateAndTieWrapper: {
      display: 'flex',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      padding: '0 0 12px 0',
      margin: '0 0 8px 0',
    },
    flexGrow: {
      flexGrow: 1,
    },
    header: {
      color: 'rgba(2,71,91,0.6)',
      margin: '16px 0 8px 0',
      fontSize: 12,
    },
    data: {
      fontSize: 15,
      fontWeight: 500,
      color: '#01475b',
    },
  };
});

const defaultMaterialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#00b38e',
    },
    text: {
      primary: '#00b38e',
    },
    action: {
      selected: '#fff',
    },
  },
  typography: {
    fontWeightMedium: 600,
    htmlFontSize: 14,
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body1: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 700,
    },
    body2: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 0,
    },
  },
});

interface errorObject {
  reasonError: boolean;
  searchError: boolean;
  otherErrorCancel: boolean;
}
interface errorObjectReshedule {
  otherError: boolean;
}
interface CallPopoverProps {
  setStartConsultAction(isVideo: boolean): void;
  createSessionAction: () => void;
  saveCasesheetAction: (onlySave: boolean, sendToPatientFlag: boolean) => void;
  endConsultAction: () => void;
  startAppointmentClick: (startAppointment: boolean) => void;
  appointmentId: string;
  appointmentDateTime: string;
  doctorId: string;
  urlToPatient: boolean;
  caseSheetId: string;
  prescriptionPdf: string;
  startAppointment: boolean;
  sessionId: string;
  token: string;
  saving: boolean;
  appointmentStatus: String;
  sentToPatient: boolean;
  isAppointmentEnded: boolean;
  setIsPdfPageOpen: (flag: boolean) => void;
  endCallNotificationAction: (callId: boolean) => void;
  pubnub: any;
  sessionClient: any;
  lastMsg: any;
  presenceEventObject: any;
}
let intervalId: any;
let stoppedTimer: number;
let timerIntervalId: any;
let stoppedConsulTimer: number;
let intervalcallId: any;
let stoppedTimerCall: number;
let patientMsgs: any = [];
let intervalMissCall: any;
let MissedcallStoppedTimerCall: number;
let missedCallCounter: number = 0;
let intervalCallAbundant: any;
let isConsultStarted: boolean = false;
let abondmentStarted: boolean = false;
let didPatientJoined: boolean = false;

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

type Params = { id: string; patientId: string };
export const CallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { currentUserType } = useAuthContext();
  const {
    appointmentInfo,
    followUpDate,
    followUpAfterInDays,
    followUp,
    patientDetails,
  } = useContext(CaseSheetContext);
  const apiDateFormat = new Date();

  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';
  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const stopcallMsg = '^^callme`stop^^';
  const acceptcallMsg = '^^callme`accept^^';
  const startConsult = '^^#startconsult';
  const stopConsult = '^^#stopconsult';
  const transferconsult = '^^#transferconsult';
  const rescheduleconsult = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const patientConsultStarted = '^^#PatientConsultStarted';
  const firstMessage = '^^#firstMessage';
  const secondMessage = '^^#secondMessage';
  const cancelConsultInitiated = '^^#cancelConsultInitiated';
  const callAbandonment = '^^#callAbandonment';
  const appointmentComplete = '^^#appointmentComplete';

  const [startTimerAppoinment, setstartTimerAppoinment] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [showAbandonment, setShowAbandonment] = React.useState(false);
  const [startingTime, setStartingTime] = useState<number>(0);
  const [doctorNextAvailableSlot, setDoctorNextAvailableSlot] = useState<string>('');

  const [dateSelected, setDateSelected] = useState<string>(moment(new Date()).format('YYYY-MM-DD'));

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

  //get Doctor's next availability slot
  const getNextAvailabityMutation = useMutation<
    GetDoctorNextAvailableSlot,
    GetDoctorNextAvailableSlotVariables
  >(GET_DOCTOR_NEXT_AVAILABILITY, {
    variables: {
      DoctorNextAvailableSlotInput: {
        doctorIds: [props.doctorId],
        availableDate: format(new Date(), 'yyyy-MM-dd'),
      },
    },
    fetchPolicy: 'no-cache',
  });

  //call abundant timer start
  const [callAbundantCallTime, setCallAbundantCallTime] = useState<number>(200);
  const callAbundantIntervalTimer = (timer: number) => {
    intervalCallAbundant = setInterval(() => {
      if (props.appointmentStatus !== STATUS.COMPLETED) {
        timer = timer - 1;
        console.log('call Abandonment', timer);
        stoppedTimerCall = timer;
        setCallAbundantCallTime(timer);
        if (timer < 1) {
          setCallAbundantCallTime(0);
          clearInterval(intervalCallAbundant);
          if (showVideo) {
            stopAudioVideoCall();
          }
          setShowAbandonment(true);
          //callInitiateReschedule(true);
        }
      } else {
        console.log('clear abundant');
        clearInterval(intervalCallAbundant);
      }
    }, 1000);
  };
  //call abundant timer end
  // timer for ring called start
  const [ringingCallTime, setRingingCallTime] = useState<number>(45);
  const missedCallIntervalTimer = (timer: number) => {
    intervalMissCall = setInterval(() => {
      timer = timer - 1;
      MissedcallStoppedTimerCall = timer;
      setRingingCallTime(timer);
      if (timer < 1) {
        setRingingCallTime(0);
        missedCallCounter++;
        clearInterval(intervalMissCall);
        stopAudioVideoCall();
        if (missedCallCounter >= 3) {
          setShowAbandonment(true);
          //callInitiateReschedule(true);
        }
      }
    }, 1000);
  };
  // timer for ring called end
  // timer for No show called
  const [remainingCallTime, setRemainingCallTime] = useState<number>(180);
  const callIntervalTimer = (timer: number) => {
    intervalcallId = setInterval(() => {
      const isAfter = moment(new Date()).isAfter(moment(props.appointmentDateTime));
      if (!didPatientJoined && props.appointmentStatus !== STATUS.COMPLETED && isAfter) {
        timer = timer - 1;
        console.log('patient no-show', timer);
        stoppedTimerCall = timer;
        setRemainingCallTime(timer);
        if (timer < 1) {
          setRemainingCallTime(0);
          clearInterval(intervalcallId);
          if (patientMsgs.length === 0) {
            noShowAction(STATUS.NO_SHOW);
          }
        }
      } else {
        clearInterval(intervalcallId);
      }
    }, 1000);
  };
  const noShowAction = (status: STATUS) => {
    if (
      window.location.pathname.indexOf('Consulttabs') > -1 ||
      window.location.pathname.indexOf('consulttabs') > -1
    ) {
      client
        .mutate<EndAppointmentSession, EndAppointmentSessionVariables>({
          mutation: END_APPOINTMENT_SESSION,
          variables: {
            endAppointmentSessionInput: {
              appointmentId: props.appointmentId,
              status: status,
              noShowBy: REQUEST_ROLES.PATIENT,
            },
          },
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          const text = {
            id: props.doctorId,
            message: callAbandonment,
            isTyping: true,
            messageDate: new Date(),
            sentBy: REQUEST_ROLES.DOCTOR,
          };
          pubnub.publish(
            {
              message: text,
              channel: channel,
              storeInHistory: true,
            },
            (status: any, response: any) => {}
          );
          unSubscribeBrowserButtonsListener();
          if (status === STATUS.NO_SHOW) {
            alert(
              'Since the patient is not responding from last 3 mins, we are rescheduling this appointment.'
            );
          }
          navigateToCalendar();
        })
        .catch((e) => {
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          const patientName = patientDetails!.firstName + ' ' + patientDetails!.lastName;
          const logObject = {
            api: 'EndAppointmentSession',
            inputParam: JSON.stringify({
              appointmentId: props.appointmentId,
              status: status,
              noShowBy: REQUEST_ROLES.PATIENT,
            }),
            appointmentId: props.appointmentId,
            doctorId: props.doctorId,
            doctorDisplayName: currentPatient!.displayName,
            patientId: params.patientId,
            patientName: patientName,
            currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
            appointmentDateTime: moment(new Date(props.appointmentDateTime)).format(
              'MMMM DD YYYY h:mm:ss a'
            ),
            error: JSON.stringify(e),
          };

          props.sessionClient.notify(JSON.stringify(logObject));
          console.log('Error occured while END_APPOINTMENT_SESSION', errorMessage, error);
          alert(errorMessage);
        });
    } else {
      clearInterval(intervalcallId);
      clearInterval(intervalCallAbundant);
    }
  };
  // timer for audio/video call end
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const [startAppointmentButton, setStartAppointmentButton] = React.useState<boolean>(true);
  const [disableOnCancel, setDisableOnCancel] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isSlotPopoverOpen, setIsSlotPopoverOpen] = useState<boolean>(false);
  const [isCancelPopoverOpen, setIsCancelPopoverOpen] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('Not related to my specialty');
  const [textOther, setTextOther] = useState(false);
  const [otherTextValue, setOtherTextValue] = useState('');
  const [textOtherCancel, setTextOtherCancel] = useState(false);
  const [otherTextCancelValue, setOtherTextCancelValue] = useState('');
  const [isClickedOnEdit, setIsClickedOnEdit] = useState(false);
  const [isClickedOnPriview, setIsClickedOnPriview] = useState(false);
  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();
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
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [consultStart, setConsultStart] = useState<boolean>(false);
  const [sendToPatientButtonDisable, setSendToPatientButtonDisable] = useState<boolean>(false);

  const toggelChatVideo = () => {
    setIsNewMsg(false);
    setShowVideoChat(!showVideoChat);
  };
  useEffect(() => {
    if (isCallAccepted) {
      startIntervalTimer(0);
    }
  }, [isCallAccepted]);
  useEffect(() => {
    if (remainingCallTime === 0) {
      clearInterval(intervalcallId);
    }
  });
  const stopIntervalTimer = () => {
    setStartingTime(0);
    timerIntervalId && clearInterval(timerIntervalId);
  };
  const stopAudioVideoCall = () => {
    setIsCallAccepted(false);
    setShowVideo(false);
    setShowVideoChat(false);
    setDisableOnCancel(false);
    clearInterval(intervalMissCall);
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const text = {
      id: props.doctorId,
      message: stopcallMsg,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };

    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status: any, response: any) => {}
    );
    const stoptext = {
      id: props.doctorId,
      message: `${isVideoCall ? 'Video' : 'Audio'} call ended`,
      duration: `${
        timerLastMinuts.toString().length < 2 ? '0' + timerLastMinuts : timerLastMinuts
      } : ${timerLastSeconds.toString().length < 2 ? '0' + timerLastSeconds : timerLastSeconds}`,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };
    pubnub.publish(
      {
        channel: channel,
        message: stoptext,
        storeInHistory: true,
        sendByPost: true,
      },
      (status: any, response: any) => {}
    );
    stopIntervalTimer();
    props.endCallNotificationAction(true);
  };
  const getCookieValue = (id: string) => {
    const name = id + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  };
  const autoSend = (callType: string) => {
    const text = {
      id: props.doctorId,
      message: callType,
      // props.startConsult === 'videocall' ? videoCallMsg : audioCallMsg,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status: any, response: any) => {
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
    clearInterval(intervalMissCall);
    setDisableOnCancel(false);
    const cookieStr = `action=`;
    document.cookie = cookieStr + ';path=/;';
    const text = {
      id: props.doctorId,
      message: stopcallMsg,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status: any, response: any) => {
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
            messageDate: new Date(),
            sentBy: REQUEST_ROLES.DOCTOR,
          },
          channel: channel,
          storeInHistory: false,
        },
        (status: any, response: any) => {}
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
      const now = new Date();
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
    const selectedDay = moment()
      .format('dddd')
      .toUpperCase();
    const consultHours = currentDoctor && currentDoctor.consultHours;
    let duration = 15;
    if (consultHours) {
      const filteredDay =
        consultHours &&
        _.filter(consultHours, function(o) {
          if (o && o.weekDay) {
            return o.weekDay === selectedDay;
          }
        });
      const consultDurationDay: any =
        filteredDay && Array.isArray(filteredDay) ? filteredDay[0] : {};
      duration =
        consultDurationDay &&
        Object.keys(consultDurationDay).length !== 0 &&
        consultDurationDay.consultDuration
          ? consultDurationDay.consultDuration
          : 15;
    }
    const disablecurrent = new Date();
    const disableconsult = new Date(props.appointmentDateTime);
    const disableyear = disableconsult.getFullYear();
    const disablemonth = disableconsult.getMonth() + 1;
    const disableday = disableconsult.getDate();
    let disablehour = disableconsult.getHours();
    //let disableminute = disableconsult.getMinutes() + 15;
    let disableminute = disableconsult.getMinutes() + duration;
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
    const aptDTTM = new Date(new Date(props.appointmentDateTime).getTime()).toISOString();
    const curTm1 = new Date().toISOString();

    if (aptDTTM.substring(0, 19) === curTm1.substring(0, 19) && isConsultStarted) {
      clearInterval(intervalcallId);
      callIntervalTimer(180);
    }
    if (
      disablecurrent >= minusTime &&
      disableaddedTime >= disablecurrent &&
      currentUserType !== LoggedInUserType.SECRETARY
    ) {
      setStartAppointmentButton(false);
    } else {
      setStartAppointmentButton(true);
    }
  };
  const client = useApolloClient();
  setInterval(startConstultCheck, 1000);
  const stopInterval = () => {
    setRemainingTime(900);
    intervalId && clearInterval(intervalId);
  };
  function handleClick(event: any) {
    if (props.startAppointment) {
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
  const { setCaseSheetEdit } = useContext(CaseSheetContext);
  useEffect(() => {
    if (props.urlToPatient) {
      onStopConsult();
    }
  }, [props.urlToPatient]);
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
  useEffect(() => {
    if (props.appointmentStatus === STATUS.COMPLETED) {
      setRemainingCallTime(0);
      clearInterval(intervalcallId);
      clearInterval(intervalCallAbundant);
      setConsultStart(false);
      //isConsultStarted = false;
    }
  }, [props.appointmentStatus]);
  const pubnub = props.pubnub;

  useEffect(() => {
    return function cleanup() {
      clearInterval(intervalcallId);
      clearInterval(intervalCallAbundant);
    };
  }, []);

  useEffect(() => {
    const lastMsg = props.lastMsg;
    if (lastMsg && lastMsg !== null) {
      if (
        !showVideoChat &&
        lastMsg.message.message !== videoCallMsg &&
        lastMsg.message.message !== audioCallMsg &&
        lastMsg.message.message !== stopcallMsg &&
        lastMsg.message.message !== acceptcallMsg &&
        lastMsg.message.message !== transferconsult &&
        lastMsg.message.message !== rescheduleconsult &&
        lastMsg.message.message !== followupconsult &&
        lastMsg.message.message !== startConsult &&
        lastMsg.message.message !== patientConsultStarted &&
        lastMsg.message.message !== firstMessage &&
        lastMsg.message.message !== secondMessage &&
        lastMsg.message.message !== covertVideoMsg &&
        lastMsg.message.message !== covertAudioMsg &&
        lastMsg.message.message !== cancelConsultInitiated &&
        lastMsg.message.message !== callAbandonment &&
        lastMsg.message.message !== appointmentComplete
      ) {
        setIsNewMsg(true);
      } else {
        setIsNewMsg(false);
      }
      if (isConsultStarted && lastMsg.message.id === params.patientId) {
        patientMsgs.push(lastMsg.message.message);
      }
      if (lastMsg.message && lastMsg.message.message === acceptcallMsg) {
        //patientMsgs.push(lastMsg.message.message);
        setIsCallAccepted(true);
        clearInterval(intervalMissCall);
        missedCallCounter = 0;
      }
    }
  }, [props.lastMsg]);

  useEffect(() => {
    const presenceEventObject = props.presenceEventObject;
    if (presenceEventObject && isConsultStarted && props.appointmentStatus !== STATUS.COMPLETED) {
      const data: any = presenceEventObject.channels[props.appointmentId].occupants;
      const occupancyPatient = data.filter((obj: any) => {
        return obj.uuid === REQUEST_ROLES.PATIENT;
      });
      if (presenceEventObject.totalOccupancy >= 2) {
        didPatientJoined = true;
        clearInterval(intervalCallAbundant);
        abondmentStarted = false;
      } else {
        if (presenceEventObject.totalOccupancy === 1 && occupancyPatient.length === 0) {
          if (!abondmentStarted && didPatientJoined) {
            abondmentStarted = true;
            callAbundantIntervalTimer(200);
            // eventsAfterConnectionDestroyed();
          }
        }
      }
    }
  }, [props.presenceEventObject]);
  const onStartConsult = () => {
    const text = {
      id: props.doctorId,
      message: startConsult,
      isTyping: true,
      automatedText: currentPatient!.displayName + ' has joined your chat!',
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };
    subscribeBrowserButtonsListener();
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status: any, response: any) => {}
    );
  };
  const onStopConsult = () => {
    const text = {
      id: props.doctorId,
      message: stopConsult,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };
    unSubscribeBrowserButtonsListener();
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status: any, response: any) => {}
    );

    let folloupDateTime = new Date(
      new Date(props.appointmentDateTime).getTime() +
        parseInt(followUpAfterInDays[0]) * 24 * 60 * 60 * 1000
    ).toISOString();
    if (
      followUp[0] &&
      followUpDate &&
      followUpDate.length > 0 &&
      followUpDate[0] !== null &&
      followUpDate[0] !== ''
    ) {
      folloupDateTime = followUpDate[0] ? new Date(followUpDate[0]).toISOString() : '';
    } else if (followUp[0] && followUpAfterInDays[0] !== 'Custom') {
      const apptdateTime = new Date(props.appointmentDateTime);
      folloupDateTime = new Date(
        apptdateTime.getTime() + parseInt(followUpAfterInDays[0]) * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    if (folloupDateTime !== '') {
      const followupObj = {
        appointmentId: props.appointmentId,
        folloupDateTime: followUp[0] ? folloupDateTime : '',
        doctorId: props.doctorId,
        caseSheetId: props.caseSheetId,
        doctorInfo: currentPatient,
        pdfUrl: props.prescriptionPdf,
      };
      setTimeout(() => {
        pubnub.publish(
          {
            message: {
              id: props.doctorId,
              message: followupconsult,
              transferInfo: followupObj,
              messageDate: new Date(),
              sentBy: REQUEST_ROLES.DOCTOR,
            },
            channel: channel,
            storeInHistory: true,
          },
          (status: any, response: any) => {}
        );
      }, 100);
    }
  };
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

  const isPastAppointment = () => {
    const selectedDay = moment()
      .format('dddd')
      .toUpperCase();
    const consultHours = currentDoctor && currentDoctor.consultHours;
    let duration = 15;
    if (consultHours) {
      const filteredDay =
        consultHours &&
        _.filter(consultHours, function(o) {
          if (o && o.weekDay) {
            return o.weekDay === selectedDay;
          }
        });
      const consultDurationDay: any =
        filteredDay && Array.isArray(filteredDay) ? filteredDay[0] : {};
      duration =
        consultDurationDay &&
        Object.keys(consultDurationDay).length !== 0 &&
        consultDurationDay.consultDuration
          ? consultDurationDay.consultDuration
          : 15;
    }
    const diff = moment.duration(
      moment(new Date(props.appointmentDateTime)).diff(
        moment(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))
      )
    );
    return diff.asMinutes() + duration < 0;
  };

  const currentDoctor = useCurrentPatient();
  const isSeniorDoctor =
    currentDoctor && currentDoctor.doctorType !== DoctorType.JUNIOR ? true : false;
  const srDoctorId = (currentDoctor && currentDoctor.id) || '';
  const mutationCancelSrdConsult = useMutation<CancelAppointment, CancelAppointmentVariables>(
    CANCEL_APPOINTMENT
  );

  const navigateToCalendar = () => {
    window.location.href = clientRoutes.calendar();
  };
  const rescheduleConsultAction = () => {
    // do api call
    //setIsLoading(true);
    if (reason === 'Other' && isEmpty(otherTextValue)) {
      setErrorStateReshedule({
        ...errorStateReshedule,
        otherError: true,
      });
    } else {
      setErrorStateReshedule({
        ...errorStateReshedule,
        otherError: false,
      });
      callInitiateReschedule(false);
    }
  };

  const initiateRescheduleMutation = useMutation(INITIATE_RESCHDULE_APPONITMENT);
  // flag: true is for missed call reschedule & false for normal
  const callInitiateReschedule = (flag: boolean) => {
    const today = moment();
    const hours = timeSelected.split(':');
    const momentDate = moment(dateSelected).hours();
    unSubscribeBrowserButtonsListener();

    const rescheduleParam = flag
      ? {
          appointmentId: props.appointmentId,
          rescheduleReason: 'Missed 3 calls from doctor',
          rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
          rescheduleInitiatedId: params.patientId,
          rescheduledDateTime: moment(today)
            .add(1, 'days')
            .toISOString(),
          autoSelectSlot: 0,
        }
      : {
          appointmentId: props.appointmentId,
          rescheduleReason: reason === 'Other' ? otherTextValue : reason,
          rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
          rescheduleInitiatedId: props.doctorId,
          //rescheduledDateTime: '2019-09-09T09:00:00.000Z',
          rescheduledDateTime:
            moment(
              new Date(
                new Date(new Date(dateSelected + 'T' + timeSelected + ':00')).getTime() +
                  new Date(
                    new Date(dateSelected + 'T' + timeSelected + ':00')
                  ).getTimezoneOffset() *
                    60000
              )
            ).format('YYYY-MM-DDTHH:mm') + ':00.000Z',
          autoSelectSlot: 0,
        };

    initiateRescheduleMutation({
      variables: {
        RescheduleAppointmentInput: rescheduleParam,
      },
      fetchPolicy: 'no-cache',
    })
      .then(({ data }: any) => {
        let rescheduledDateTime = '';
        let rescheduleCount = 0;
        let reschduleId = '';
        if (data && data.initiateRescheduleAppointment) {
          if (data.initiateRescheduleAppointment.rescheduleAppointment) {
            rescheduledDateTime =
              data.initiateRescheduleAppointment.rescheduleAppointment.rescheduledDateTime || '';
            reschduleId = data.initiateRescheduleAppointment.rescheduleAppointment.id || '';
          }
          rescheduleCount = data.initiateRescheduleAppointment.rescheduleCount || 0;
        }

        const reschduleObject: any = {
          appointmentId: props.appointmentId,
          transferDateTime: rescheduledDateTime,
          doctorId: props.doctorId,
          reschduleCount: rescheduleCount,
          doctorInfo: currentPatient,
          reschduleId: reschduleId,
        };
        pubnub.publish(
          {
            message: {
              id: props.doctorId,
              message: rescheduleconsult,
              transferInfo: reschduleObject,
              messageDate: new Date(),
              isTyping: true,
              sentBy: REQUEST_ROLES.DOCTOR,
            },
            channel: channel, //chanel
            storeInHistory: true,
          },
          (status: any, response: any) => {
            navigateToCalendar();
          }
        );
        setIsPopoverOpen(false);
        setDisableOnCancel(true);
      })
      .catch((e) => {
        //setIsLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log(
          'Error occured while searching for Initiate reschdule apppointment',
          errorMessage,
          error
        );
        const patientName = patientDetails!.firstName + ' ' + patientDetails!.lastName;
        const logObject = {
          api: 'INITIATE_RESCHDULE_APPONITMENT',
          inputParam: JSON.stringify(rescheduleParam),
          appointmentId: props.appointmentId,
          doctorId: props.doctorId,
          doctorDisplayName: currentPatient!.displayName,
          patientId: params.patientId,
          patientName: patientName,
          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
          appointmentDateTime: moment(new Date(props.appointmentDateTime)).format(
            'MMMM DD YYYY h:mm:ss a'
          ),
          error: JSON.stringify(e),
        };

        props.sessionClient.notify(JSON.stringify(logObject));
        alert(errorMessage);
      });
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
  const showCallMoreBtns =
    props.appointmentStatus === STATUS.COMPLETED &&
    props.sentToPatient === false &&
    (isClickedOnPriview || props.sentToPatient === false) &&
    !isClickedOnEdit
      ? true
      : false;

  const [timeSelected, setTimeSelected] = useState<string>('');
  const calendarRef = useRef<HTMLDivElement>(null);
  return (
    <div className={classes.stickyHeader}>
      <div className={classes.breadcrumbs}>
        <div>
          {(props.appointmentStatus !== STATUS.COMPLETED || isClickedOnEdit) && (
            <Prompt message="Are you sure to exit?" when={props.startAppointment}></Prompt>
          )}
          <Link to="/calendar">
            <div className={classes.backArrow}>
              <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
              <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
            </div>
          </Link>
        </div>
        CONSULT ROOM &nbsp;
        <span className={classes.timeLeft}>
          {props.startAppointment
            ? `| Time Left ${minutes.toString().length < 2 ? '0' + minutes : minutes} : ${
                seconds.toString().length < 2 ? '0' + seconds : seconds
              }`
            : getTimerText()}
        </span>
        <div className={classes.consultButtonContainer}>
          <span>
            {props.appointmentStatus === STATUS.COMPLETED &&
            currentUserType !== LoggedInUserType.SECRETARY &&
            props.sentToPatient === true ? (
              <span className={classes.prescriptionSent}>
                PRESCRIPTION SENT
                {/* <Button className={classes.backButton}>PRESCRIPTION SENT</Button> */}
              </span>
            ) : (
              props.appointmentStatus === STATUS.COMPLETED &&
              currentUserType !== LoggedInUserType.SECRETARY &&
              props.sentToPatient === false && (
                <span>
                  {(isClickedOnPriview || props.sentToPatient === false) && !isClickedOnEdit && (
                    <Fragment>
                      <Button
                        className={classes.backButton}
                        disabled={sendToPatientButtonDisable}
                        onClick={() => {
                          setIsClickedOnEdit(true);
                          setIsClickedOnPriview(false);
                          setCaseSheetEdit(true);
                          props.setIsPdfPageOpen(false);
                        }}
                      >
                        Edit Case Sheet
                      </Button>
                      <Button
                        className={classes.endconsultButton}
                        disabled={sendToPatientButtonDisable}
                        onClick={() => {
                          setSendToPatientButtonDisable(true);
                          props.saveCasesheetAction(true, true);
                        }}
                      >
                        {sendToPatientButtonDisable && 'Please wait...'}
                        { sendToPatientButtonDisable ? <CircularProgress size={22} /> : 'Send To Patient'}
                      </Button>
                    </Fragment>
                  )}
                  {isClickedOnEdit && (
                    <Fragment>
                      <Button
                        className={classes.backButton}
                        onClick={() => props.saveCasesheetAction(true, false)}
                      >
                        Save
                      </Button>
                      <Button
                        className={classes.endconsultButton}
                        disabled={props.saving}
                        onClick={() => {
                          props.saveCasesheetAction(true, false);
                          setIsClickedOnEdit(false);
                          setIsClickedOnPriview(true);
                          props.setIsPdfPageOpen(true);
                        }}
                      >
                        Preview Prescription
                      </Button>
                    </Fragment>
                  )}
                </span>
              )
            )}
            {(props.appointmentStatus !== STATUS.COMPLETED ||
              currentUserType === LoggedInUserType.SECRETARY) &&
              (props.startAppointment ? (
                <span>
                  <Button
                    className={classes.backButton}
                    disabled={props.saving}
                    onClick={() => {
                      props.saveCasesheetAction(true, false);
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    className={classes.endconsultButton}
                    disabled={props.saving}
                    onClick={() => {
                      stopInterval();
                      if (showVideo) {
                        stopAudioVideoCall();
                      }
                      props.endConsultAction();
                      isConsultStarted = false;
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <g fill="none" fillRule="evenodd">
                        <path d="M0 0h24v24H0z" />
                        <path
                          fill="#ffffff"
                          fillRule="nonzero"
                          d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
                        />
                      </g>
                    </svg>
                    End Consult
                  </Button>
                  {props.saving && (
                    <span>
                      <CircularProgress className={classes.loading} />
                      <div className={classes.fadedBg}></div>
                    </span>
                  )}
                </span>
              ) : (
                <Button
                  className={classes.consultButton}
                  disabled={
                    currentUserType === LoggedInUserType.SECRETARY ||
                    startAppointmentButton ||
                    disableOnCancel ||
                    (appointmentInfo!.appointmentState !== 'NEW' &&
                      appointmentInfo!.appointmentState !== 'TRANSFER' &&
                      appointmentInfo!.appointmentState !== 'RESCHEDULE') ||
                    (appointmentInfo!.status !== STATUS.IN_PROGRESS &&
                      appointmentInfo!.status !== STATUS.PENDING)
                  }
                  onClick={() => {
                    !props.startAppointment ? onStartConsult() : onStopConsult();
                    !props.startAppointment ? startInterval(900) : stopInterval();
                    props.startAppointmentClick(!props.startAppointment);
                    props.createSessionAction();
                    setCaseSheetEdit(true);
                    setConsultStart(true);
                    isConsultStarted = true;
                    callIntervalTimer(180);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path fill="#fff" d="M8 5v14l11-7z" />
                  </svg>
                  Start Consult
                </Button>
              ))}
            {props.appointmentStatus !== STATUS.COMPLETED && (
              <Button
                className={classes.backButton}
                disabled={
                  (isPastAppointment() && !consultStart) ||
                  (appointmentInfo && appointmentInfo.appointmentState === 'AWAITING_RESCHEDULE') ||
                  props.appointmentStatus === STATUS.NO_SHOW ||
                  props.appointmentStatus === STATUS.CALL_ABANDON ||
                  isCallAccepted
                }
                onClick={() => {
                  setLoading(true);
                  const rescheduleCountByDoctor =
                    (appointmentInfo && appointmentInfo.rescheduleCountByDoctor) || 0;
                  if (rescheduleCountByDoctor >= 3) {
                    setIsCancelDialogOpen(true);
                  } else {
                    setIsCancelDialogOpen(false);
                    setIsPopoverOpen(true);
                    getNextAvailabityMutation()
                      .then(({ data }: any) => {
                        try {
                          if (
                            data &&
                            data.getDoctorNextAvailableSlot &&
                            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
                            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                          ) {
                            setDoctorNextAvailableSlot(
                              data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                                .availableSlot || ''
                            );
                            setDateSelected(
                              moment(
                                data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                                  .availableSlot
                              ).format('YYYY-MM-DD')
                            );

                            setTimeSelected(
                              moment(
                                data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                                  .availableSlot
                              ).format('HH:mm')
                            );
                          }
                        } catch (error) {
                          const patientName =
                            patientDetails!.firstName + ' ' + patientDetails!.lastName;
                          const logObject = {
                            appointmentId: props.appointmentId,
                            doctorId: props.doctorId,
                            doctorDisplayName: currentPatient!.displayName,
                            patientId: params.patientId,
                            patientName: patientName,
                            currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                            appointmentDateTime: moment(new Date(props.appointmentDateTime)).format(
                              'MMMM DD YYYY h:mm:ss a'
                            ),
                            error: JSON.stringify(error),
                          };

                          props.sessionClient.notify(JSON.stringify(logObject));
                          setDoctorNextAvailableSlot('');
                          alert(error);
                        } finally {
                          setLoading(false);
                        }
                      })
                      .catch((e) => {
                        console.log(e);
                        const patientName =
                          patientDetails!.firstName + ' ' + patientDetails!.lastName;
                        const logObject = {
                          api: 'getDoctorNextAvailableSlots',
                          inputParam: JSON.stringify({
                            doctorIds: [props.doctorId],
                            availableDate: format(new Date(), 'yyyy-MM-dd'),
                          }),
                          appointmentId: props.appointmentId,
                          doctorId: props.doctorId,
                          doctorDisplayName: currentPatient!.displayName,
                          patientId: params.patientId,
                          patientName: patientName,
                          currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                          appointmentDateTime: moment(new Date(props.appointmentDateTime)).format(
                            'MMMM DD YYYY h:mm:ss a'
                          ),
                          error: JSON.stringify(e),
                        };
                        props.sessionClient.notify(JSON.stringify(logObject));
                      });
                  }
                }}
              >
                Reschedule
              </Button>
            )}
            {!showCallMoreBtns && (
              <Button
                className={classes.consultIcon}
                aria-describedby={id}
                variant="contained"
                onClick={(e) => handleClick(e)}
                disabled={
                  props.appointmentStatus === STATUS.COMPLETED ||
                  props.appointmentStatus === STATUS.CANCELLED ||
                  (isPastAppointment() && !consultStart)
                }
              >
                <img src={require('images/ic_call.svg')} />
              </Button>
            )}
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
                    disabled={disableOnCancel}
                    onClick={() => {
                      handleClose();
                      props.setStartConsultAction(false);
                      autoSend(audioCallMsg);
                      setDisableOnCancel(true);
                      setIsVideoCall(false);
                      missedCallIntervalTimer(45);
                    }}
                  >
                    <img src={require('images/call_popup.svg')} alt="" />
                    AUDIO CALL
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.needHelp}
                    disabled={disableOnCancel}
                    onClick={() => {
                      handleClose();
                      props.setStartConsultAction(true);
                      autoSend(videoCallMsg);
                      setIsVideoCall(true);
                      setDisableOnCancel(true);
                      missedCallIntervalTimer(45);
                    }}
                  >
                    <img src={require('images/video_popup.svg')} alt="" />
                    VIDEO CALL
                  </Button>
                </div>
              </Paper>
            </Popover>
            {!showCallMoreBtns && (
              <Button
                className={classes.consultIcon}
                aria-describedby={idThreeDots}
                disabled={
                  props.appointmentStatus === STATUS.COMPLETED ||
                  props.appointmentStatus === STATUS.CANCELLED ||
                  props.isAppointmentEnded ||
                  disableOnCancel ||
                  (isPastAppointment() && !consultStart) ||
                  (appointmentInfo!.appointmentState !== 'NEW' &&
                    appointmentInfo!.appointmentState !== 'TRANSFER' &&
                    appointmentInfo!.appointmentState !== 'RESCHEDULE') ||
                  (appointmentInfo!.status !== STATUS.IN_PROGRESS &&
                    appointmentInfo!.status !== STATUS.PENDING)
                }
                onClick={(e) => handleClickThreeDots(e)}
              >
                <img src={require('images/ic_more.svg')} />
              </Button>
            )}
            <Popover
              id={idThreeDots}
              className={classes.dotPaper}
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
              <div>
                <ul className={classes.popOverUL}>
                  {/* <li>Share Case Sheet</li> */}
                  {currentUserType !== LoggedInUserType.SECRETARY && (
                    <li
                      onClick={() => {
                        if (
                          appointmentInfo!.status === STATUS.PENDING ||
                          appointmentInfo!.status === STATUS.IN_PROGRESS
                        ) {
                          handleCloseThreeDots();
                          setIsCancelPopoverOpen(true);
                        } else {
                          alert('You are not allowed to cancel the appointment.');
                        }
                      }}
                    >
                      End or Cancel Consult
                    </li>
                  )}
                </ul>
              </div>
            </Popover>
          </span>
        </div>
        <Modal
          className={classes.modalPopup}
          open={isPopoverOpen}
          onClose={() => {
            setIsPopoverOpen(false);
          }}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <div>
            <Paper className={classes.modalBox}>
              <div className={classes.tabHeader}>
                <h4>RESCHEDULE CONSULT</h4>
                <Button className={classes.cross}>
                  <img
                    src={require('images/ic_cross.svg')}
                    alt=""
                    onClick={() => {
                      setIsPopoverOpen(false);
                    }}
                  />
                </Button>
              </div>
              <Scrollbars autoHide={true} style={{ minHeight: 'calc(52vh)' }}>
                <div className={classes.tabBody}>
                  <p>The following slot will be suggested —</p>
                  {doctorNextAvailableSlot === '' || loading ? (
                    <CircularProgress />
                  ) : (
                    <div className={classes.dateAndTieWrapper}>
                      <div className={classes.flexGrow}>
                        <Typography component="h5" variant="h5" className={classes.header}>
                          Date
                        </Typography>
                        <div className={classes.data}>
                          {dateSelected && timeSelected
                            ? moment(dateSelected + 'T' + timeSelected + ':00.000').format(
                                'ddd, DD/MM/YYYY'
                              )
                            : moment(doctorNextAvailableSlot).format('ddd, DD/MM/YYYY')}
                        </div>
                      </div>
                      <div className={classes.flexGrow}>
                        <Typography component="h5" variant="h5" className={classes.header}>
                          Time
                        </Typography>
                        <div className={classes.data}>
                          {dateSelected && timeSelected
                            ? moment(dateSelected + 'T' + timeSelected + ':00.000').format('h:mm a')
                            : moment(doctorNextAvailableSlot).format('h:mm a')}
                        </div>
                      </div>
                    </div>

                    // <form noValidate>
                    //   <TextField
                    //     id="datetime-local"
                    //     label="Date & Time"
                    //     type="datetime-local"
                    //     defaultValue={dateSelected || doctorNextAvailableSlot}
                    //     className={classes.textField}
                    //     InputLabelProps={{
                    //       shrink: true
                    //     }}
                    //   />
                    // </form>
                  )}
                  <AphButton
                    className={classes.suggestSlot}
                    onClick={() => {
                      setIsSlotPopoverOpen(true);
                    }}
                  >
                    SUGGEST ANOTHER SLOT
                  </AphButton>
                </div>

                <div className={`${classes.tabBody} ${classes.tabbodyothers}`}>
                  <p>Why do you want to reschedule?</p>
                  {!reason.trim() && <span className={classes.selectText}>Select a Reason</span>}
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
              </Scrollbars>
              <div className={classes.tabFooter}>
                <Button
                  className={classes.ResheduleCosultButton}
                  disabled={!reason}
                  onClick={() => {
                    rescheduleConsultAction();
                  }}
                >
                  Reschedule Consult
                </Button>
              </div>
            </Paper>
          </div>
        </Modal>
        <Modal
          className={classes.modalPopup}
          open={isSlotPopoverOpen}
          onClose={() => setIsSlotPopoverOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <div>
            <Paper className={classes.modalBoxTabs}>
              <div className={classes.tabHeader}>
                <h4>PICK A SLOT</h4>
                <Button className={classes.cross}>
                  <img
                    src={require('images/ic_cross.svg')}
                    alt=""
                    onClick={() => {
                      setIsSlotPopoverOpen(false);
                    }}
                  />
                </Button>
              </div>
              <AvailableSlots
                setIsPopoverOpen={setIsSlotPopoverOpen}
                rescheduleConsultAction={rescheduleConsultAction}
                doctorId={props.doctorId}
                setTimeSelected={setTimeSelected}
                setDateSelected={setDateSelected}
                dateSelected={dateSelected}
                timeSelected={timeSelected}
              />
            </Paper>
          </div>
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
                className={classes.cancelConsult}
                onClick={() => {
                  setIsCancelPopoverOpen(false);
                  setCancelError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className={classes.ResheduleCosultButton}
                disabled={textOtherCancel && otherTextCancelValue === ''}
                onClick={() => {
                  mutationCancelSrdConsult({
                    variables: {
                      cancelAppointmentInput: {
                        appointmentId: params.id,
                        cancelReason:
                          cancelReason === 'Other' ? otherTextCancelValue : cancelReason,
                        cancelledBy: isSeniorDoctor ? REQUEST_ROLES.DOCTOR : REQUEST_ROLES.JUNIOR,
                        cancelledById: isSeniorDoctor ? srDoctorId || '' : params.patientId,
                      },
                    },
                  })
                    .then((response) => {
                      if (showVideo) {
                        stopAudioVideoCall();
                      }
                      unSubscribeBrowserButtonsListener();
                      setIsCancelPopoverOpen(false);
                      cancelConsultAction();
                      const text = {
                        id: props.doctorId,
                        message: cancelConsultInitiated,
                        isTyping: true,
                        messageDate: new Date(),
                        sentBy: REQUEST_ROLES.DOCTOR,
                      };
                      pubnub.publish(
                        {
                          message: text,
                          channel: channel,
                          storeInHistory: true,
                        },
                        (status: any, response: any) => {
                          navigateToCalendar();
                        }
                      );
                    })
                    .catch((e: ApolloError) => {
                      const patientName =
                        patientDetails!.firstName + ' ' + patientDetails!.lastName;
                      const logObject = {
                        api: 'CancelAppointment',
                        inputParam: JSON.stringify({
                          appointmentId: params.id,
                          cancelReason:
                            cancelReason === 'Other' ? otherTextCancelValue : cancelReason,
                          cancelledBy: isSeniorDoctor ? REQUEST_ROLES.DOCTOR : REQUEST_ROLES.JUNIOR,
                          cancelledById: isSeniorDoctor ? srDoctorId || '' : params.patientId,
                        }),
                        appointmentId: props.appointmentId,
                        doctorId: props.doctorId,
                        doctorDisplayName: currentPatient!.displayName,
                        patientId: params.patientId,
                        patientName: patientName,
                        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                        appointmentDateTime: moment(new Date(props.appointmentDateTime)).format(
                          'MMMM DD YYYY h:mm:ss a'
                        ),
                        error: JSON.stringify(e),
                      };

                      props.sessionClient.notify(JSON.stringify(logObject));
                      setCancelError(e.graphQLErrors[0].message);
                    });
                }}
              >
                Cancel Consult
              </Button>
            </div>
          </Paper>
        </Modal>
      </div>
      {/* audio/video start*/}
      <div className={classes.posRelative}>
        <div className={showVideo ? '' : classes.audioVideoContainer}>
          {showVideo && (
            <Consult
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
      {/* cancel Confirmation modal start */}
      <Modal
        open={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBoxConsult}>
          <div className={classes.tabHeader}>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setIsCancelDialogOpen(false)}
              />
            </Button>
          </div>
          <div className={classes.tabBody}>
            <h3>
              You have reached limit of rescheduling the same appointment for 3 times, please
              confirm if you want to proceed with Cancelling this appointment
            </h3>

            <Button
              className={classes.cancelConsult}
              //disabled={startAppointmentButton}
              onClick={() => setIsCancelDialogOpen(false)}
            >
              No
            </Button>
            <Button
              className={classes.consultButton}
              onClick={() => {
                mutationCancelSrdConsult({
                  variables: {
                    cancelAppointmentInput: {
                      appointmentId: params.id,
                      cancelReason: 'MAX_RESCHEDULES_EXCEEDED',
                      cancelledBy: isSeniorDoctor ? REQUEST_ROLES.DOCTOR : REQUEST_ROLES.JUNIOR,
                      cancelledById: isSeniorDoctor ? srDoctorId || '' : params.patientId,
                    },
                  },
                })
                  .then((response) => {
                    setIsCancelDialogOpen(false);
                    const text = {
                      id: props.doctorId,
                      message: cancelConsultInitiated,
                      isTyping: true,
                      messageDate: new Date(),
                      sentBy: REQUEST_ROLES.DOCTOR,
                    };
                    unSubscribeBrowserButtonsListener();
                    pubnub.publish(
                      {
                        message: text,
                        channel: channel,
                        storeInHistory: true,
                      },
                      (status: any, response: any) => {
                        navigateToCalendar();
                      }
                    );
                  })
                  .catch((e: ApolloError) => {
                    const patientName = patientDetails!.firstName + ' ' + patientDetails!.lastName;
                    const logObject = {
                      api: 'CancelAppointment',
                      inputParam: JSON.stringify({
                        appointmentId: params.id,
                        cancelReason: 'MAX_RESCHEDULES_EXCEEDED',
                        cancelledBy: isSeniorDoctor ? REQUEST_ROLES.DOCTOR : REQUEST_ROLES.JUNIOR,
                        cancelledById: isSeniorDoctor ? srDoctorId || '' : params.patientId,
                      }),
                      appointmentId: props.appointmentId,
                      doctorId: props.doctorId,
                      doctorDisplayName: currentPatient!.displayName,
                      patientId: params.patientId,
                      patientName: patientName,
                      currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
                      appointmentDateTime: moment(new Date(props.appointmentDateTime)).format(
                        'MMMM DD YYYY h:mm:ss a'
                      ),
                      error: JSON.stringify(e),
                    };

                    props.sessionClient.notify(JSON.stringify(logObject));
                    setCancelError(e.graphQLErrors[0].message);
                    setIsCancelDialogOpen(false);
                  });
              }}
              // onClick={() => {
              //   setIsCancelDialogOpen(false);
              // }}
            >
              Yes
            </Button>
          </div>
        </Paper>
      </Modal>
      {/* cancel Confirmation modal end */}
      {/* Call abandonment Confirmation modal start */}
      <Modal
        open={showAbandonment}
        onClose={() => setShowAbandonment(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.modalBoxConsult}>
          <div className={classes.tabHeader}>
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setShowAbandonment(false)}
              />
            </Button>
          </div>
          <div className={`${classes.tabBody} ${classes.tabBodypadding}`}>
            <h3>
              We are sorry, but it seems your patient is no longer active on the application. You
              may wish to reschedule this consult.
            </h3>

            <Button className={classes.cancelConsult} onClick={() => setShowAbandonment(false)}>
              Continue
            </Button>
            <Button
              className={classes.consultButton}
              onClick={() => {
                noShowAction(STATUS.CALL_ABANDON);
              }}
            >
              Reschedule
            </Button>
          </div>
        </Paper>
      </Modal>
      {/* Call abandonment Confirmation modal end */}
    </div>
  );
};
