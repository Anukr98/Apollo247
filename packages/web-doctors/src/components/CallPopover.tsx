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
import { Link } from 'react-router-dom';
import Pubnub from 'pubnub';
import moment from 'moment';
import { isEmpty, debounce, trim } from 'lodash';
import { AphSelect, AphTextField } from '@aph/web-ui-components';
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
  InitiateRescheduleAppointment,
  InitiateRescheduleAppointmentVariables,
} from 'graphql/types/InitiateRescheduleAppointment';
import {
  INITIATE_TRANSFER_APPONITMENT,
  SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
  INITIATE_RESCHDULE_APPONITMENT,
} from 'graphql/profiles';
import { TRANSFER_INITIATED_TYPE, STATUS } from 'graphql/types/globalTypes';
import { CaseSheetContext } from 'context/CaseSheetContext';

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
      marginRight: 10,
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
      marginRight: 10,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#890000',
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
      minHeight: 480,
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
        borderRadius: 10,
        paddingLeft: 10,
        '& :before': {
          border: 0,
        },
      },
    },
    doctorSearch: {
      position: 'relative',
      display: 'block',
      padding: 10,
      zIndex: 9,
      backgroundColor: '#fff',
      borderRadius: 10,
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
export const CallPopover: React.FC<CallPopoverProps> = (props) => {
  const classes = useStyles();
  const { loading, appointmentInfo, caseSheetId, followUpDate } = useContext(CaseSheetContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [startAppointment, setStartAppointment] = React.useState<boolean>(false);
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
      sessionStorage.getItem('loggedInMobileNumber') !== currentPatient!.delegateNumber
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
  const startConsult = '^^#startconsult';
  const stopConsult = '^^#stopconsult';
  const transferconsult = '^^#transferconsult';
  const rescheduleconsult = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const channel = props.appointmentId;
  const config: Pubnub.PubnubConfig = {
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  const { caseSheetEdit, setCaseSheetEdit } = useContext(CaseSheetContext);
  useEffect(() => {
    if (props.isEnded) {
      onStopConsult();
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
      message: (message) => {},
      // presence: (presenceEvent) => {
      //   console.log('presenceEvent', presenceEvent);
      // },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: [channel] });
    };
  }, []);

  const onStartConsult = () => {
    const text = {
      id: props.doctorId,
      message: startConsult,
      isTyping: true,
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
  const onStopConsult = () => {
    const text = {
      id: props.doctorId,
      message: stopConsult,
      isTyping: true,
    };
    pubnub.publish(
      {
        message: text,
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
    if (
      followUpDate &&
      followUpDate.length > 0 &&
      followUpDate[0] !== null &&
      followUpDate[0] !== ''
    ) {
      const folloupDateTime = followUpDate[0] ? new Date(followUpDate[0]).toISOString() : '';
      const followupObj: any = {
        appointmentId: props.appointmentId,
        folloupDateTime: folloupDateTime,
        doctorId: props.doctorId,
      };
      pubnub.publish(
        {
          message: {
            id: props.doctorId,
            message: followupconsult,
            transferInfo: followupObj,
          },
          channel: channel,
          storeInHistory: true,
        },
        (status, response) => {}
      );
    }
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
      client
        .mutate<InitiateRescheduleAppointment, InitiateRescheduleAppointmentVariables>({
          mutation: INITIATE_RESCHDULE_APPONITMENT,
          variables: {
            RescheduleAppointmentInput: {
              appointmentId: props.appointmentId,
              rescheduleReason: reason === 'Other' ? otherTextValue : reason,
              rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
              rescheduleInitiatedId: props.doctorId,
              rescheduledDateTime: '2019-09-09T09:00:00.000Z',
              autoSelectSlot: 0,
            },
          },
        })
        .then((_data) => {
          //setIsLoading(false);
          console.log('data', _data);
          const reschduleObject: any = {
            appointmentId: props.appointmentId,
            transferDateTime: _data!.data!.initiateRescheduleAppointment!.rescheduleAppointment!
              .rescheduledDateTime,
            doctorId: props.doctorId,
            reschduleCount: _data!.data!.initiateRescheduleAppointment!.rescheduleCount,
            reschduleId: _data!.data!.initiateRescheduleAppointment!.rescheduleAppointment!.id,
          };
          console.log('reschduleObject', reschduleObject);
          pubnub.publish(
            {
              message: {
                id: props.doctorId,
                message: rescheduleconsult,
                transferInfo: reschduleObject,
              },
              channel: channel, //chanel
              storeInHistory: true,
            },
            (status, response) => {}
          );
          setIsPopoverOpen(false);
          setDisableOnTransfer(true);
        })
        .catch((e) => {
          //setIsLoading(false);
          console.log('Error occured while searching for Initiate reschdule apppointment', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log(
            'Error occured while searching for Initiate reschdule apppointment',
            errorMessage,
            error
          );
          alert(errorMessage);
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
    <div className={classes.breadcrumbs}>
      <div>
        <Link to="/calendar">
          <div className={classes.backArrow}>
            <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div>
        </Link>
      </div>
      CONSULT ROOM &nbsp;
      <span className={classes.timeLeft}>
        {startAppointment
          ? `| Time Left ${minutes.toString().length < 2 ? '0' + minutes : minutes} : ${
              seconds.toString().length < 2 ? '0' + seconds : seconds
            }`
          : getTimerText()}
      </span>
      <div className={classes.consultButtonContainer}>
        <span>
          {startAppointment ? (
            <span>
              <Button
                className={classes.backButton}
                onClick={() => {
                  props.saveCasesheetAction(true);
                }}
              >
                Save
              </Button>
              <Button
                className={classes.endconsultButton}
                onClick={() => {
                  //onStopConsult();
                  setStartAppointment(!startAppointment);
                  stopInterval();
                  props.endConsultAction();
                  setCaseSheetEdit(false);
                  setDisableOnTransfer(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
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
            </span>
          ) : (
            <Button
              className={classes.consultButton}
              disabled={
                startAppointmentButton ||
                disableOnTransfer ||
                appointmentInfo!.appointmentState !== 'NEW' ||
                (appointmentInfo!.status !== STATUS.IN_PROGRESS &&
                  appointmentInfo!.status !== STATUS.PENDING)
              }
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
            </Button>
          )}
          <Button
            className={classes.consultIcon}
            aria-describedby={id}
            variant="contained"
            onClick={(e) => handleClick(e)}
          >
            <img src={require('images/ic_call.svg')} />
          </Button>
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
                  }}
                >
                  <img src={require('images/video_popup.svg')} alt="" />
                  VIDEO CALL
                </Button>
              </div>
            </Paper>
          </Popover>
          <Button
            className={classes.consultIcon}
            aria-describedby={idThreeDots}
            disabled={
              startAppointmentButton ||
              disableOnTransfer ||
              appointmentInfo!.appointmentState !== 'NEW' ||
              (appointmentInfo!.status !== STATUS.IN_PROGRESS &&
                appointmentInfo!.status !== STATUS.PENDING)
            }
            onClick={(e) => handleClickThreeDots(e)}
          >
            <img src={require('images/ic_more.svg')} />
          </Button>

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
                <li
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
                >
                  Transfer Consult
                </li>
                {!startAppointment && appointmentInfo!.status === STATUS.PENDING && (
                  <li
                    onClick={() => {
                      handleCloseThreeDots();
                      setIsPopoverOpen(true);
                    }}
                  >
                    Reschedule Consult
                  </li>
                )}
              </ul>
            </div>
          </Popover>
        </span>
      </div>
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
                  clearTransferField();
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
              <MenuItem value="Others" classes={{ selected: classes.menuSelected }}>
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
                setSearchKeyword(e.target.value);
                if (e.target.value.length > 2) {
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
            {isDoctorOrSpeciality && searchKeyWord.length > 2 && (
              <span className={classes.doctorSearch}>
                <h6>Doctor(s)</h6>
                {filteredStarDoctors!.length > 0 ? (
                  <ul>
                    {filteredStarDoctors!.map((item: any, idx: any) => (
                      <li
                        key={idx}
                        onClick={() => {
                          handleDoctorClick(item);
                        }}
                      >
                        {item.firstName} {item.lastName}
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
                clearTransferField();
              }}
            >
              Cancel
            </Button>
            <Button
              className={classes.ResheduleCosultButton}
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
    </div>
  );
};
