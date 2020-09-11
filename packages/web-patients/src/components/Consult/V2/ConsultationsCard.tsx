import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar, Modal, Paper, CircularProgress, Popover } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
import { GetPatientAllAppointments_getPatientAllAppointments_appointments as AppointmentDetails } from 'graphql/types/GetPatientAllAppointments';
import { DoctorType, APPOINTMENT_STATE, APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import _isNull from 'lodash/isNull';
import { format } from 'date-fns';
import { clientRoutes } from 'helpers/clientRoutes';
import isTomorrow from 'date-fns/isTomorrow';
import isToday from 'date-fns/isToday';
import {
  TRANSFER_INITIATED_TYPE,
  BookRescheduleAppointmentInput,
  STATUS,
} from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { AphButton, AphDialogTitle } from '@aph/web-ui-components';
import moment from 'moment';
import {
  readableParam,
  getAvailableFreeChatDays,
  removeGraphQLKeyword,
} from 'helpers/commonHelpers';
import { Link, Route } from 'react-router-dom';
import { useApolloClient } from 'react-apollo-hooks';
import { useMutation } from 'react-apollo-hooks';
import { OnlineConsult } from 'components/OnlineConsult';
import {
  GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails,
  GetDoctorDetailsById_getDoctorDetailsById_starTeam,
  GetDoctorDetailsById_getDoctorDetailsById_consultHours,
} from 'graphql/types/GetDoctorDetailsById';
import { BOOK_APPOINTMENT_RESCHEDULE } from 'graphql/profiles';
import { Alerts } from 'components/Alerts/Alerts';
import {
  getAppointmentRescheduleDetails,
  getAppointmentRescheduleDetailsVariables,
} from 'graphql/types/getAppointmentRescheduleDetails';
import { GET_APPOINTMENT_DOCTOR_RESCHEDULED_DETAILS } from 'graphql/consult';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '15px 0',
    },
    consultationSection: {
      paddingBottom: 10,
    },
    consultCard: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      padding: 16,
      position: 'relative',
    },
    consultCardWrap: {
      display: 'flex',
    },
    doctorAvatar: {
      width: 70,
      height: 70,
      marginTop: 10,
    },
    doctorInfo: {
      paddingLeft: 15,
      paddingTop: 15,
      width: 'calc(100% - 80px)',
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 10,
    },
    doctorType: {
      fontSize: 10,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
      letterSpacing: 0.25,
    },
    doctorExp: {
      paddingLeft: 8,
      marginLeft: 5,
      paddingRight: 5,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 1,
        height: 10,
        top: 1,
        left: 0,
        backgroundColor: '#0087ba',
      },
    },
    consultaitonType: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      marginTop: 8,
      paddingTop: 5,
      '& span:last-child': {
        marginLeft: 'auto',
        cursor: 'pointer',
        display: 'flex',
      },
    },
    modalBox: {
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
    popupHeading: {
      padding: '20px 10px',
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0 50px',
      },
    },
    dialogContent: {
      margin: 22,

      position: 'relative',
      '& h6': {
        fontSize: 15,
        fontWeight: 500,
        margin: 0,
        lineHeight: 'normal',
      },
    },
    highlightedText: {
      color: '#0087BA',
    },
    dialogActions: {
      padding: 10,
      position: 'relative',
      fontSize: 14,
      fontWeight: 600,
      maxWidth: 170,
      display: 'inline-flex',
      '& button': {
        borderRadius: 10,
        minwidth: 130,
        padding: '8px 20px',
        fontSize: 14,
        fontWeight: 600,
      },
    },
    dialogActionsProgress: {
      marginLeft: 135,
    },
    primaryBtn: {
      backgroundColor: '#fc9916 !important',
      display: 'flex',
      flex: '0 0 100%',
    },
    secondaryBtn: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: 'transparent',
      boxShadow: '0 2px 5px 0 rgba(0,0,0,0.2)',
      border: 'none',
      display: 'flex',
      flex: '0 0 100%',
      marginRight: 10,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
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
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginBottom: 0,
      },
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
    appointBooked: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 5,
      paddingTop: 5,
      '& ul': {
        padding: 0,
        margin: 0,
        marginLeft: -2,
        marginRight: -2,
        '& li': {
          borderRadius: 10,
          backgroundColor: 'rgba(0,135,186,0.08)',
          listStyleType: 'none',
          padding: '6px 12px',
          fontSize: 9,
          fontWeight: 'bold',
          color: '#0087ba',
          marginTop: 5,
          display: 'inline-block',
          textTransform: 'uppercase',
          marginLeft: 2,
          marginRight: 2,
        },
      },
    },
    availability: {
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,135,186,0.11)',
      padding: '6px 12px',
      color: '#02475b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 10,
      position: 'absolute',
      right: 0,
      top: 0,
      minWidth: 134,
    },
    statusShow: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'left',
      padding: '6px 12px',
      color: '#0087BA',
      textTransform: 'capitalize',
      letterSpacing: 0.5,
      borderRadius: 10,
      position: 'absolute',
      left: 8,
      top: 0,
      minWidth: 134,
      '&.COMPLETED': {
        color: '#00B38E',
      },
      '&.CANCELLED': {
        color: '#DB0404',
      },
    },

    availableNow: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white,
    },
    startDoctor: {
      position: 'relative',
      '& span': {
        position: 'absolute',
        top: 66,
        left: '50%',
        marginLeft: -14,
        '& img': {
          verticalAlign: 'middle',
        },
      },
    },
    disableLink: {
      pointerEvents: 'none',
    },
    cardBottomActons: {
      borderTop: '0.5px solid rgba(2,71,91,0.6)',
      paddingTop: 10,
      marginTop: 10,
      textAlign: 'right',
      display: 'none',
      '& button': {
        border: 'none',
        backgroundColor: 'transparent',
        color: '#fc9916',
        boxShadow: 'none',
        padding: 0,
      },
    },
    noteText: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
    messageBox: {
      padding: '10px 20px 25px 20px',
      '& p': {
        fontSize: 14,
        color: '#01475b',
        fontWeight: 500,
        lineHeight: '18px',
      },
    },
    appDownloadBtn: {
      backgroundColor: '#fcb716',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      padding: '9px 24px',
      display: 'block',
      textAlign: 'center',
    },
    textCenter: {
      textAlign: 'center',
    },
    consultChatContainer: {
      position: 'relative',
    },
    consultRow: {
      borderTop: '1px solid  rgb(2,71,91, 0.4)',
      marginTop: 6,
    },
    consultChat: {
      paddingTop: 10,
      marginTop: 0,
      textAlign: 'right',
      position: 'relative',
      minHeight: 34,
      '& h3': {
        fontSize: 13,
        lineHeight: '24px',
        color: '#FC9916',
        margin: 0,
        textTransform: 'uppercase',
      },
      '& h6': {
        fontSize: 11,
        fontWeight: '600',
        lineHeight: '16px',
        color: '#02475B',
        margin: 0,
      },
      '& h5': {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: '20px',
        color: '#02475B',
        margin: '0 0 7px 0',
        textAlign: 'left',
      },
    },
    bookFollowup: {
      // borderTop: '1px solid  rgb(2,71,91, 0.4)',
      paddingTop: 10,
      marginTop: 6,
      textAlign: 'left',
      position: 'absolute',
      left: 0,
      top: -5,
      width: '48%',
      '& h3': {
        fontSize: 13,
        lineHeight: '24px',
        color: '#FC9916',
        margin: 0,
      },
      '& h6': {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: '14px',
        color: '#02475B',
        margin: 0,
      },
    },
    chatIcon: {
      position: 'relative',
      marginRight: 8,
    },
    chatIconCount: {
      width: 9,
      height: 9,
      background: '#FC9916',
      borderRadius: '50%',
      color: '#fff',
      fontSize: 6,
      lineHeight: '8px',
      textAlign: 'center',
      position: 'absolute',
      fontWeight: 'normal',
      top: -6,
      right: -9,
    },
    consultIcon: {
      position: 'relative',
      top: 3,
    },
    presButton: {
      background: '#0087BA',
      borderRadius: 10,
      fontWeight: 500,
      fontSize: 12,
      lineHeight: '20px',
      color: '#fff',
      width: '100%',
      textAlign: 'left',
      textTransform: 'capitalize',
      marginBottom: 10,
      '&:hover': {
        background: '#0087BA',
      },
      '& img': {
        marginRight: 10,
      },
    },
    btnContent: {
      width: '80%',
    },
    errorButton: {
      background: 'rgba(229,0,0,0.1)',
      borderRadius: 10,
      fontWeight: 500,
      fontSize: 12,
      lineHeight: '18px',
      color: '#890000',
      width: '100%',
      textAlign: 'left',
      textTransform: 'none',
      marginBottom: 5,
      marginTop: 15,
      '&:hover': {
        background: 'rgba(229,0,0,0.1)',
      },
    },
  };
});

interface ConsultationsCardProps {
  appointments: AppointmentDetails[];
  pastOrCurrent: string;
}

export const ConsultationsCard: React.FC<ConsultationsCardProps> = (props) => {
  const classes = useStyles({});
  const client = useApolloClient();
  const mascotRef = useRef(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentDetails | null>(null);
  // const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [isChangeSlot, setIsChangeSlot] = useState<boolean>(false);
  const [openSlotPopup, setOpenSlotPopup] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [rescheduleCount, setRescheduleCount] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [reschedulesRemaining, setReschedulesRemaining] = useState<number | null>(null);
  const [isRescheduleSuccess, setIsRescheduleSuccess] = useState<boolean>(false);
  const [rescheduledSlot, setRescheduledSlot] = useState<string | null>(null);
  const [doctorSelectedSlot, setDoctorSelectedSlot] = useState<string | null>(null);
  const [doctorSelectedSlotLoading, setDoctorSelectedSlotLoading] = useState<boolean>(false);

  const otherDateMarkup = (appointmentTime: number) => {
    if (isToday(new Date(appointmentTime))) {
      return format(new Date(appointmentTime), 'h:mm a');
    } else if (isTomorrow(new Date(appointmentTime))) {
      return `Tomorrow ${format(new Date(appointmentTime), 'h:mm a')}`;
    } else {
      return format(new Date(appointmentTime), 'dd MMM yyyy, h:mm a');
    }
  };

  const [refreshTimer, setRefreshTimer] = useState<boolean>(false);

  const shouldRefreshComponent = (diff: number) => {
    const id = setInterval(() => {
      id && clearInterval(id);
      if (diff <= 15 && diff >= -1) {
        setRefreshTimer(!refreshTimer);
      }
    }, 60000);
  };

  const getAppointmentStatus = (status: STATUS, isConsultStarted: boolean | null) => {
    switch (status) {
      case STATUS.PENDING:
        return isConsultStarted ? 'GO TO CONSULT ROOM' : 'FILL MEDICAL DETAILS';
      case STATUS.NO_SHOW || STATUS.CALL_ABANDON:
        return 'PICK ANOTHER SLOT';
      case STATUS.COMPLETED:
        return props.pastOrCurrent === 'past' ? '' : 'TEXT CONSULT';
      case STATUS.IN_PROGRESS:
        return 'CHAT WITH DOCTOR';
      case STATUS.CANCELLED:
        return 'BOOK AGAIN';
    }
  };

  const showAppointmentAction = (
    appointmentState: APPOINTMENT_STATE | null,
    status: STATUS,
    isConsultStarted: boolean | null
  ) => {
    if (appointmentState) {
      switch (appointmentState) {
        case APPOINTMENT_STATE.NEW:
          return getAppointmentStatus(status, isConsultStarted);
        case APPOINTMENT_STATE.AWAITING_RESCHEDULE:
          return 'PICK ANOTHER SLOT';
        case APPOINTMENT_STATE.RESCHEDULE:
          return isConsultStarted ? 'GO TO CONSULT ROOM' : 'FILL MEDICAL DETAILS';
      }
    }
    // need to add one more condition for view prescription for this have to query casesheet
    getAppointmentStatus(status, isConsultStarted);
  };

  const getConsultationUpdateText = (appointmentDetails: AppointmentDetails) => {
    const {
      isSeniorConsultStarted,
      isJdQuestionsComplete,
      isFollowUp,
      isConsultStarted,
      status,
    } = appointmentDetails;
    if (isFollowUp === 'false' && status === STATUS.COMPLETED) {
      return getAvailableFreeChatDays(appointmentDetails.appointmentDateTime);
    } else if (status !== STATUS.COMPLETED) {
      if (!isConsultStarted) {
        return 'Fill vitals to get started with the consult journey';
      } else if (!isJdQuestionsComplete) {
        return 'Connect with Junior Doctor before final consult';
      } else if (!isSeniorConsultStarted) {
        return 'Connect with doctor to start the consult';
      }
    }
  };

  const showStatusAtTop = (appointmentDetails: AppointmentDetails) => {
    const { status, appointmentState, isFollowUp } = appointmentDetails;
    if (status === STATUS.CANCELLED) {
      return 'Cancelled';
    } else if (status === STATUS.COMPLETED) {
      return 'Completed';
    } else if (appointmentState === APPOINTMENT_STATE.RESCHEDULE) {
      return 'Rescheduled';
    } else if (isFollowUp === 'true') {
      return 'Follow Up Appointment';
    } else {
      return null;
    }
  };

  const getDoctorDetails = (appointmentData: AppointmentDetails) => {
    if (appointmentData && appointmentData.doctorInfo) {
      const {
        firstName,
        salutation,
        lastName,
        fullName,
        mobileNumber,
        specialization,
        languages,
        city,
        awards,
        displayName,
        photoUrl,
        registrationNumber,
        onlineConsultationFees,
        physicalConsultationFees,
        qualification,
        doctorType,
        specialty,
        zip,
        doctorHospital,
        experience,
        id,
      } = appointmentData.doctorInfo;

      const consultHours =
        appointmentData.doctorInfo.consultHours &&
        appointmentData.doctorInfo.consultHours.map((hours) => {
          const {
            consultMode,
            consultType,
            endTime,
            id,
            startTime,
            weekDay,
            isActive,
            actualDay,
          } = hours;
          return {
            consultMode,
            consultType,
            endTime,
            id,
            startTime,
            weekDay,
            isActive,
            actualDay,
          };
        });

      return {
        __typename: 'DoctorDetails',
        firstName,
        salutation,
        lastName,
        fullName,
        mobileNumber,
        specialization,
        languages,
        city,
        awards,
        displayName,
        photoUrl,
        registrationNumber,
        onlineConsultationFees,
        physicalConsultationFees,
        qualification,
        doctorType,
        specialty,
        zip,
        starTeam: appointmentData.doctorInfo
          .starTeam as GetDoctorDetailsById_getDoctorDetailsById_starTeam[],
        doctorHospital,
        experience,
        consultHours: consultHours as GetDoctorDetailsById_getDoctorDetailsById_consultHours[],
        id,
      } as DoctorDetails;
    }
  };

  const bookAppointment = useMutation(BOOK_APPOINTMENT_RESCHEDULE);

  const rescheduleAPI = (
    bookRescheduleInput: BookRescheduleAppointmentInput,
    type: TRANSFER_INITIATED_TYPE
  ) => {
    bookAppointment({
      variables: {
        bookRescheduleAppointmentInput: bookRescheduleInput,
      },
      fetchPolicy: 'no-cache',
    })
      .then((data: any) => {
        setIsModalOpen(false);
        setApiLoading(false);
        setReschedulesRemaining(
          type === TRANSFER_INITIATED_TYPE.PATIENT ? 3 - rescheduleCount - 1 : 3 - rescheduleCount
        );
        setIsRescheduleSuccess(true);
        setRescheduledSlot(bookRescheduleInput.newDateTimeslot);
      })

      .catch((e) => {
        console.log(e);
        setApiLoading(false);
        setIsAlertOpen(true);
        setAlertMessage(
          `Error occured while rescheduling the appointment(${removeGraphQLKeyword(e)})`
        );
      });
  };

  const handleAcceptReschedule = (appointmentData: AppointmentDetails) => {
    setApiLoading(true);
    const bookRescheduleInput = {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      newDateTimeslot: doctorSelectedSlot,
      initiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
      initiatedId: appointmentData.patientId,
      patientId: appointmentData.patientId,
      rescheduledId: '',
    };
    rescheduleAPI(bookRescheduleInput, TRANSFER_INITIATED_TYPE.DOCTOR);
  };

  const getAppointmentNextSlotInitiatedByDoctor = (appointmentDetails: AppointmentDetails) => {
    setAppointmentData(appointmentDetails);
    setRescheduleCount(appointmentDetails.rescheduleCount);
    setDoctorSelectedSlotLoading(true);
    client
      .query<getAppointmentRescheduleDetails, getAppointmentRescheduleDetailsVariables>({
        query: GET_APPOINTMENT_DOCTOR_RESCHEDULED_DETAILS,
        variables: {
          appointmentId: appointmentDetails.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }: any) => {
        if (
          data &&
          data.getAppointmentRescheduleDetails &&
          data.getAppointmentRescheduleDetails.rescheduledDateTime
        ) {
          setDoctorSelectedSlot(data.getAppointmentRescheduleDetails.rescheduledDateTime);
          setIsModalOpen(true);
        }
      })
      .catch((e) => {
        console.log(e);
        setDoctorSelectedSlot(null);
      })
      .finally(() => {
        setDoctorSelectedSlotLoading(false);
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.consultationSection}>
        <Grid container spacing={2}>
          {props.appointments.map((appointmentDetails, index) => {
            if (appointmentDetails) {
              const appointmentId = appointmentDetails.id;
              const {
                appointmentState,
                status,
                appointmentDateTime,
                doctorId,
                isConsultStarted,
                doctorInfo,
              } = appointmentDetails;
              let fullName = null;
              let photoUrl = null;
              let experience = null;
              let specialty = null;
              let doctorHospital = null;
              if (doctorInfo) {
                fullName = doctorInfo.fullName;
                experience = doctorInfo.experience;
                specialty = doctorInfo.specialty;
                doctorHospital = doctorInfo.doctorHospital;
              }

              const doctorImage = photoUrl || require('images/no_photo.png');
              const specialization =
                specialty && !_isNull(specialty.name) ? specialty.specialistSingularTerm : '';
              const currentTime = new Date().getTime();
              const appointmentTime = new Date(appointmentDateTime).getTime();
              const difference = Math.round((appointmentTime - currentTime) / 60000);
              shouldRefreshComponent(difference);
              const day1 = moment(appointmentDetails.appointmentDateTime).add(7, 'days');
              const day2 = moment(new Date());
              const comparingDays = () => {
                return day1.diff(day2, 'days') == 0
                  ? 'Today'
                  : day1.diff(day2, 'days') +
                      ' more ' +
                      (day1.diff(day2, 'days') == 1 ? 'day' : 'days');
              };
              const clinicList = doctorHospital || [];
              let facilityName = '',
                streetName = '';
              if (
                clinicList &&
                clinicList.length > 0 &&
                clinicList[0] &&
                clinicList[0].facility &&
                clinicList[0].facility.name
              ) {
                facilityName = clinicList[0].facility.name;
                streetName =
                  clinicList[0].facility.streetLine1 &&
                  clinicList[0].facility.streetLine1.length > 0
                    ? clinicList[0].facility.streetLine1
                    : '';
              }
              return (
                <Grid item sm={4} xs={12} key={index}>
                  <div className={classes.consultCard}>
                    <div className={classes.consultCardWrap}>
                      <div className={classes.startDoctor}>
                        <Avatar
                          alt="Doctor Image"
                          src={doctorImage}
                          className={classes.doctorAvatar}
                        />
                        {appointmentDetails.doctorInfo &&
                          appointmentDetails.doctorInfo.doctorType === DoctorType.STAR_APOLLO && (
                            <span>
                              <img src={require('images/ic_star.svg')} alt="" />
                            </span>
                          )}
                      </div>
                      <div className={classes.doctorInfo}>
                        {showStatusAtTop(appointmentDetails) && (
                          // <div className={classes.statusShow}>
                          <div className={`${classes.statusShow} ${appointmentState}`}>
                            {showStatusAtTop(appointmentDetails)}
                          </div>
                        )}
                        <div
                          className={`${classes.availability} ${
                            difference <= 15 && difference > 0 ? classes.availableNow : ''
                          }`}
                        >
                          {appointmentDetails.appointmentType === 'ONLINE'
                            ? difference <= 15 && difference > 0
                              ? `Available in ${difference} ${difference === 1 ? 'MIN' : 'MINS'}`
                              : otherDateMarkup(appointmentTime)
                            : 'Clinic Visit'}
                        </div>
                        {fullName && (
                          <div className={classes.doctorName}>{`${_startCase(
                            _toLower(fullName)
                          )}`}</div>
                        )}
                        <div className={classes.doctorType}>
                          {specialization}
                          {experience && (
                            <span className={classes.doctorExp}>{experience} YRS</span>
                          )}
                        </div>
                        <div className={classes.consultaitonType}>
                          <span>
                            {appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE
                              ? 'Online Consultation'
                              : `${facilityName}, ${streetName}`}
                          </span>
                          <span>
                            {appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE ? (
                              <img src={require('images/ic-video.svg')} alt="" />
                            ) : (
                              <img src={require('images/fa-solid-hospital.svg')} alt="" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={classes.consultChatContainer}>
                      <div className={classes.consultRow}>
                        {props.pastOrCurrent !== 'past' &&
                          appointmentDetails.appointmentState ===
                            APPOINTMENT_STATE.AWAITING_RESCHEDULE && (
                            <AphButton className={classes.errorButton}>
                              Sorry, we had to reschedule this appointment. Please pick another
                              slot.
                            </AphButton>
                          )}
                        <div className={classes.consultChat}>
                          {/* <h5>Previous Prescription</h5>
                        <AphButton className={classes.presButton}>
                          <img src={require('images/ic_prescription_white.svg')} alt="" />
                          <span className={classes.btnContent}>Cytoplam, Metformin, Insulin…</span>
                          <img src={require('images/ic_arrow_right_white.svg')} alt="" />
                        </AphButton> */}
                          {(appointmentDetails.status === STATUS.COMPLETED ||
                            props.pastOrCurrent === 'past') &&
                            appointmentDetails.isFollowUp === 'false' && (
                              <div className={classes.bookFollowup}>
                                <Route
                                  render={({ history }) => (
                                    <h3
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => {
                                        if (props.pastOrCurrent === 'past') {
                                          history.push(
                                            clientRoutes.chatRoom(appointmentId, doctorId)
                                          );
                                        }
                                      }}
                                    >
                                      {props.pastOrCurrent !== 'past' ? '' : 'VIEW CHAT'}
                                    </h3>
                                  )}
                                />
                              </div>
                            )}
                          <Route
                            render={({ history }) => (
                              <div
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  const pickAnotherSlot =
                                    appointmentDetails.status === STATUS.NO_SHOW ||
                                    appointmentDetails.status === STATUS.CALL_ABANDON ||
                                    appointmentDetails.appointmentState ===
                                      APPOINTMENT_STATE.AWAITING_RESCHEDULE;
                                  const doctorName =
                                    appointmentDetails.doctorInfo &&
                                    appointmentDetails.doctorInfo.fullName
                                      ? readableParam(appointmentDetails.doctorInfo.fullName)
                                      : '';
                                  if (pickAnotherSlot) {
                                    getAppointmentNextSlotInitiatedByDoctor(appointmentDetails);
                                  } else {
                                    appointmentDetails.status === STATUS.CANCELLED ||
                                    (appointmentDetails.status === STATUS.COMPLETED &&
                                      props.pastOrCurrent === 'past')
                                      ? history.push(
                                          clientRoutes.doctorDetails(
                                            doctorName,
                                            appointmentDetails.doctorId
                                          )
                                        )
                                      : history.push(
                                          clientRoutes.chatRoom(appointmentId, doctorId)
                                        );
                                  }
                                }}
                              >
                                <h3>
                                  {appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE
                                    ? showAppointmentAction(
                                        appointmentState,
                                        status,
                                        isConsultStarted
                                      )
                                    : 'VIEW DETAILS'}
                                </h3>
                              </div>
                            )}
                          />
                          {appointmentDetails.appointmentState !==
                            APPOINTMENT_STATE.AWAITING_RESCHEDULE &&
                            props.pastOrCurrent !== 'past' && (
                              <h6>{getConsultationUpdateText(appointmentDetails)}</h6>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Grid>
              );
            }
          })}
        </Grid>
      </div>
      {appointmentData && doctorSelectedSlot && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Paper className={classes.modalBox} style={{ width: isChangeSlot ? 700 : 328 }}>
            <div
              className={classes.modalBoxClose}
              onClick={() => {
                setIsModalOpen(false);
                setIsChangeSlot(false);
              }}
            >
              <img src={require('images/ic_cross_popup.svg')} alt="" />
            </div>
            <AphDialogTitle className={classes.popupHeading}>Reschedule</AphDialogTitle>
            <div>
              {isChangeSlot ? (
                <OnlineConsult
                  setIsPopoverOpen={setIsModalOpen}
                  doctorDetails={getDoctorDetails(appointmentData)}
                  isRescheduleConsult={rescheduleCount < 3}
                  appointmentId={appointmentData.id}
                  rescheduleAPI={rescheduleAPI}
                />
              ) : (
                <div>
                  <div className={classes.dialogContent}>
                    Dr.{appointmentData.doctorInfo && appointmentData.doctorInfo.fullName} has
                    suggested the below slot for rescheduling this appointment —
                    {moment(doctorSelectedSlot).format(' DD MMMM YYYY, hh:mm A')}
                  </div>
                  <div className={classes.dialogActions}>
                    {doctorSelectedSlotLoading ? (
                      <div className={classes.dialogActionsProgress}>
                        <CircularProgress size={22} color="primary" />
                      </div>
                    ) : (
                      <>
                        <AphButton
                          className={classes.secondaryBtn}
                          color="primary"
                          onClick={() => setIsChangeSlot(true)}
                        >
                          {'CHANGE SLOT'}
                        </AphButton>

                        <AphButton
                          className={classes.primaryBtn}
                          color="primary"
                          onClick={() => {
                            handleAcceptReschedule(appointmentData);
                          }}
                        >
                          {apiLoading ? (
                            <CircularProgress size={22} color="secondary" />
                          ) : (
                            <span>ACCEPT</span>
                          )}
                        </AphButton>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Paper>
        </Modal>
      )}
      {appointmentData && (
        <Popover
          open={isRescheduleSuccess}
          anchorEl={mascotRef.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          classes={{ paper: classes.bottomPopover }}
        >
          <div className={classes.successPopoverWindow}>
            <div className={classes.windowWrap}>
              <div className={classes.mascotIcon}>
                <img src={require('images/ic-mascot.png')} alt="" />
              </div>
              <div className={classes.windowBody}>
                <p>Hi! :)</p>
                <p>
                  Your appointment with Dr.
                  {` ${appointmentData.doctorInfo && appointmentData.doctorInfo.fullName} `}
                  has been rescheduled for -{' '}
                  {rescheduledSlot && moment(rescheduledSlot).format('Do MMMM, dddd \nhh:mm a')}
                </p>
                {reschedulesRemaining >= 0 && (
                  <p>You have {reschedulesRemaining} free reschedueles left</p>
                )}
              </div>
              <div className={classes.actions}>
                <AphButton
                  onClick={() => {
                    window.location.href = clientRoutes.appointments();
                  }}
                >
                  OK, GOT IT
                </AphButton>
              </div>
            </div>
          </div>
        </Popover>
      )}
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
