import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import React, { useState } from 'react';
import { GetPatientAllAppointments_getPatientAllAppointments_appointments as AppointmentDetails } from 'graphql/types/GetPatientAllAppointments';
import { DoctorType, APPOINTMENT_STATE, APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import _isNull from 'lodash/isNull';
import { format } from 'date-fns';
import { clientRoutes } from 'helpers/clientRoutes';
import isTomorrow from 'date-fns/isTomorrow';
import isToday from 'date-fns/isToday';
import { STATUS } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { AphButton } from '@aph/web-ui-components';
import { ApolloError } from 'apollo-client';
import { useMutation } from 'react-apollo-hooks';
import { AddToConsultQueue, AddToConsultQueueVariables } from 'graphql/types/AddToConsultQueue';
import { ADD_TO_CONSULT_QUEUE } from 'graphql/consult';
import moment from 'moment';
import { readableParam } from 'helpers/commonHelpers';
import { Link, Route } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '20px 5px 10px 5px',
    },
    consultationSection: {
      paddingLeft: 15,
      paddingRight: 15,
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
      width: 80,
      height: 80,
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
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '6px 12px',
      color: '#ff748e',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 10,
      position: 'absolute',
      left: 0,
      top: 0,
      minWidth: 134,
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
    consultChat: {
      borderTop: '1px solid  rgb(2,71,91, 0.4)',
      paddingTop: 10,
      marginTop: 6,
      textAlign: 'right',
      '& h3': {
        fontSize: 13,
        lineHeight: '24px',
        color: '#FC9916',
        margin: 0,
        textTransform: 'uppercase',
      },
      '& h6': {
        fontSize: 12,
        fontWeight: '500',
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
      left: 15,
      top: -6,
      '& h3': {
        fontSize: 13,
        lineHeight: '24px',
        color: '#FC9916',
        margin: 0,
      },
      '& h6': {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: '16px',
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
      marginBottom: 10,
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

  const addConsultToQueue = useMutation<AddToConsultQueue, AddToConsultQueueVariables>(
    ADD_TO_CONSULT_QUEUE
  );

  const getAppointmentStatus = (status: STATUS, isConsultStarted: boolean | null) => {
    switch (status) {
      case STATUS.PENDING:
        return isConsultStarted ? 'CONTINUE CONSULT' : 'FILL MEDICAL DETAILS';
      case STATUS.NO_SHOW || STATUS.CALL_ABANDON:
        return 'PICK ANOTHER SLOT';
      case STATUS.COMPLETED:
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
    if (props.pastOrCurrent === 'past') {
      return STATUS.CANCELLED ? 'BOOK AGAIN' : 'BOOK FOLLOW UP';
    } else if (appointmentState) {
      switch (appointmentState) {
        case APPOINTMENT_STATE.NEW:
          return getAppointmentStatus(status, isConsultStarted);
        case APPOINTMENT_STATE.AWAITING_RESCHEDULE:
          return 'PICK ANOTHER SLOT';
        case APPOINTMENT_STATE.RESCHEDULE:
          return isConsultStarted ? 'CONTINUE CONSULT' : 'FILL MEDICAL DETAILS';
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
    if (isFollowUp === 'false' && status === STATUS.COMPLETED && props.pastOrCurrent !== 'past') {
      return '7 days free chat remaining';
    } else if (!isConsultStarted) {
      return 'Fill vitals to get started with the consult journey';
    } else if (!isJdQuestionsComplete) {
      return 'Connect with Junior Doctor before final consult';
    } else if (!isSeniorConsultStarted) {
      return 'Connect with doctor to start the consult';
    }
  };

  const showStatusAtTop = (appointmentDetails: AppointmentDetails) => {
    const { status, appointmentState, isFollowUp } = appointmentDetails;
    if (status === STATUS.CANCELLED) {
      return 'Cancelled';
    } else if (props.pastOrCurrent === 'past' && status === STATUS.COMPLETED) {
      return 'Completed';
    } else if (appointmentState === APPOINTMENT_STATE.RESCHEDULE) {
      return 'Rescheduled';
    } else if (isFollowUp === 'true') {
      return 'Follow Up Appointment';
    } else {
      return null;
    }
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
                          <div className={classes.statusShow}>
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
                      <Link
                        to={clientRoutes.doctorDetails(
                          appointmentDetails.doctorInfo && appointmentDetails.doctorInfo.fullName
                            ? readableParam(appointmentDetails.doctorInfo.fullName)
                            : '',
                          appointmentDetails.doctorId
                        )}
                      >
                        {appointmentDetails.status === STATUS.COMPLETED &&
                          appointmentDetails.isFollowUp === 'false' && (
                            <div className={classes.bookFollowup}>
                              <h3>
                                {props.pastOrCurrent !== 'past' ? 'BOOK FOLLOWUP' : 'VIEW DETAILS'}
                              </h3>
                              {props.pastOrCurrent !== 'past' &&
                                appointmentDetails &&
                                appointmentDetails.doctorInfo &&
                                appointmentDetails.doctorInfo.fullName && (
                                  <h6>With {appointmentDetails.doctorInfo.fullName}</h6>
                                )}
                            </div>
                          )}
                      </Link>
                      <div className={classes.consultChat}>
                        {/* <h5>Previous Prescription</h5>
                        <AphButton className={classes.presButton}>
                          <img src={require('images/ic_prescription_white.svg')} alt="" />
                          <span className={classes.btnContent}>Cytoplam, Metformin, Insulin…</span>
                          <img src={require('images/ic_arrow_right_white.svg')} alt="" />
                        </AphButton> */}
                        {appointmentDetails.appointmentState ===
                          APPOINTMENT_STATE.AWAITING_RESCHEDULE && (
                          <AphButton className={classes.errorButton}>
                            Sorry, we had to reschedule this appointment. Please pick another slot.
                          </AphButton>
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
                                appointmentDetails.status !== STATUS.CANCELLED &&
                                props.pastOrCurrent !== 'past'
                                  ? !pickAnotherSlot &&
                                    history.push(clientRoutes.chatRoom(appointmentId, doctorId))
                                  : history.push(
                                      clientRoutes.doctorDetails(
                                        doctorName,
                                        appointmentDetails.doctorId
                                      )
                                    );
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
                          APPOINTMENT_STATE.AWAITING_RESCHEDULE && (
                          <h6>{getConsultationUpdateText(appointmentDetails)}</h6>
                        )}
                      </div>
                    </div>
                  </div>
                </Grid>
              );
            }
          })}
        </Grid>
      </div>
    </div>
  );
};
