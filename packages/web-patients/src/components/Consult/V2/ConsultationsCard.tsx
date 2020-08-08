import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar, Switch } from '@material-ui/core';
import React, { useState } from 'react';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import {
  // GetPatientAppointments,
  GetPatientAppointments_getPatinetAppointments_patinetAppointments as appointmentDetails,
} from 'graphql/types/GetPatientAppointments';
import { DoctorType, APPOINTMENT_STATE, APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import _isNull from 'lodash/isNull';
// import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { clientRoutes } from 'helpers/clientRoutes';
import isTomorrow from 'date-fns/isTomorrow';
import isToday from 'date-fns/isToday';
// import { getIstTimestamp } from 'helpers/dateHelpers';
import { STATUS } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { AphButton } from '@aph/web-ui-components';
import { ApolloError } from 'apollo-client';
import { useMutation } from 'react-apollo-hooks';
import { AddToConsultQueue, AddToConsultQueueVariables } from 'graphql/types/AddToConsultQueue';
import { ADD_TO_CONSULT_QUEUE } from 'graphql/consult';
import moment from 'moment';
import { getAppStoreLink } from 'helpers/dateHelpers';

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
      },
      '& h6': {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: '16px',
        color: '#02475B',
        margin: 0,
      },
    },
  };
});

interface ConsultationsCardProps {
  appointments: appointmentDetails[];
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
  const [isScheduledAppPopoverOpen, setIsScheduledAppPopoverOpen] = useState<boolean>(false);
  const [isAppDetailsPopoverOpen, setIsAppDetailsPopoverOpen] = useState<boolean>(false);
  const [currentDoctorName, setCurrentDoctorName] = useState<string>('');
  const [currentApptTime, setCurrentApptTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');

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
      case STATUS.COMPLETED:
        return 'CHAT WITH DOCTOR';
      default:
        return 'CHAT WITH DOCTOR';
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
          return isConsultStarted ? 'CONTINUE CONSULT' : 'FILL MEDICAL DETAILS';
        default:
          return 'CHAT WITH DOCTOR';
      }
    }
    getAppointmentStatus(status, isConsultStarted);
  };

  return (
    <div className={classes.root}>
      <div className={classes.consultationSection}>
        <Grid container spacing={2}>
          {props.appointments.map((appointmentDetails, index) => {
            const appointmentId = appointmentDetails.id;
            const {
              appointmentState,
              status,
              appointmentDateTime,
              doctorId,
              isConsultStarted,
            } = appointmentDetails;
            const {
              fullName,
              photoUrl,
              experience,
              specialty,
              doctorHospital,
            } = appointmentDetails.doctorInfo;
            const doctorImage = photoUrl || require('images/no_photo.png');
            const specialization =
              specialty && !_isNull(specialty.name) ? specialty.specialistSingularTerm : '';
            const currentTime = new Date().getTime();
            const appointmentTime = new Date(appointmentDateTime).getTime();
            const difference = Math.round((appointmentTime - currentTime) / 60000);
            shouldRefreshComponent(difference);
            const day1 = moment(appointmentDetails.appointmentDateTime).add(7, 'days');
            const day2 = moment(new Date());
            // day1.diff(day2, 'days'); // 1
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
                clinicList[0].facility.streetLine1 && clinicList[0].facility.streetLine1.length > 0
                  ? clinicList[0].facility.streetLine1
                  : '';
            }
            return (
              <Grid item sm={4} xs={12} key={index}>
                <div
                  className={classes.consultCard}
                  onClick={() => {
                    if (props.pastOrCurrent === 'past') {
                      setIsAppDetailsPopoverOpen(true);
                    } else {
                      setIsScheduledAppPopoverOpen(true);
                      setAppointmentType(
                        appointmentDetails.appointmentType === 'ONLINE' ? 'online' : 'clinic'
                      );
                      setCurrentDoctorName(fullName);
                      setCurrentApptTime(
                        moment(appointmentDetails.appointmentDateTime).format(
                          'MMMM DD, YYYY [at] LT'
                        )
                      );
                    }
                  }}
                >
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
                      {/* <Link to={clientRoutes.doctorDetails(doctorId)} target="_blank"> */}
                      <div className={classes.doctorName}>{`${_startCase(
                        _toLower(fullName)
                      )}`}</div>
                      {/* </Link> */}
                      <div className={classes.doctorType}>
                        {specialization}
                        <span className={classes.doctorExp}>{experience} YRS</span>
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
                  <div className={classes.consultChat}>
                    <h3>GO TO CONSULT CHAT ROOM</h3>
                    <h6>Connect with Junior Doctor before final consult</h6>
                  </div>
                  <div className={classes.cardBottomActons}>
                    <AphButton
                      onClick={() => {
                        if (
                          appointmentState === APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
                          isConsultStarted
                        ) {
                          window.location.href = clientRoutes.chatRoom(appointmentId, doctorId);
                        } else {
                          isConsultStarted
                            ? (window.location.href = clientRoutes.chatRoom(
                                appointmentId,
                                doctorId
                              ))
                            : addConsultToQueue({
                                variables: {
                                  appointmentId,
                                },
                              })
                                .then((res) => {
                                  window.location.href = clientRoutes.chatRoom(
                                    appointmentId,
                                    doctorId
                                  );
                                })
                                .catch((e: ApolloError) => {
                                  alert(e);
                                });
                        }
                      }}
                    >
                      {appointmentDetails.isFollowUp === 'false'
                        ? showAppointmentAction(appointmentState, status, isConsultStarted)
                        : 'SCHEDULE FOLLOWUP'}
                    </AphButton>
                    {status === STATUS.COMPLETED ? (
                      <div className={classes.noteText}>
                        You can chat with the doctor for {comparingDays()}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </div>

      <AphDialog open={isScheduledAppPopoverOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsScheduledAppPopoverOpen(false)} title={'Close'} />
        <AphDialogTitle>Scheduled Appointment</AphDialogTitle>
        <div className={classes.messageBox}>
          <p>
            You have {appointmentType === 'online' ? 'an online consultation' : 'clinic visit'}{' '}
            scheduled with {currentDoctorName} for {currentApptTime}.
          </p>
          <p>Kindly visit the app to continue with the consultation or to make any changes.</p>
          <a className={classes.appDownloadBtn} href={getAppStoreLink()} target="_blank">
            Download Apollo247 App
          </a>
        </div>
      </AphDialog>

      <AphDialog open={isAppDetailsPopoverOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAppDetailsPopoverOpen(false)} title={'Close'} />
        <AphDialogTitle>Appointment Details</AphDialogTitle>
        <div className={classes.messageBox}>
          <p className={classes.textCenter}>
            Kindly visit the app to access your appointment details.
          </p>
          <p className={classes.textCenter}>Download the app by clicking below.</p>
          <a className={classes.appDownloadBtn} href={getAppStoreLink()} target="_blank">
            Download Apollo247 App
          </a>
        </div>
      </AphDialog>
    </div>
  );
};
