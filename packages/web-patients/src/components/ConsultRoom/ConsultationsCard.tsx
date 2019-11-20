import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import React, { useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {
  GetPatientAppointments,
  GetPatientAppointments_getPatinetAppointments_patinetAppointments as appointmentDetails,
} from 'graphql/types/GetPatientAppointments';
import { DoctorType, APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import _isNull from 'lodash/isNull';
import { Link } from 'react-router-dom';
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

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '0 5px',
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
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 8,
      paddingTop: 5,
      '& span:last-child': {
        marginLeft: 'auto',
        cursor: 'pointer',
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
  };
});

interface ConsultationsCardProps {
  appointments: GetPatientAppointments;
}

export const ConsultationsCard: React.FC<ConsultationsCardProps> = (props) => {
  const classes = useStyles({});

  let bookedAppointments: appointmentDetails[] = [];

  if (
    props.appointments.getPatinetAppointments.patinetAppointments &&
    props.appointments.getPatinetAppointments.patinetAppointments.length > 0
  ) {
    bookedAppointments = props.appointments.getPatinetAppointments.patinetAppointments;
  }

  // filter appointments that are greater than current time.
  const filterAppointments = bookedAppointments.filter((appointmentDetails) => {
    const currentTime = new Date().getTime();
    const appointmentTime = new Date(appointmentDetails.appointmentDateTime).getTime();

    if (appointmentTime > currentTime) {
      return appointmentDetails;
    }
  });

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

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 214px)'}>
        <div className={classes.consultationSection}>
          <Grid container spacing={2}>
            {filterAppointments.map((appointmentDetails, index) => {
              const appointmentId = appointmentDetails.id;
              const firstName =
                appointmentDetails.doctorInfo && appointmentDetails.doctorInfo.firstName
                  ? appointmentDetails.doctorInfo.firstName
                  : '';
              const lastName =
                appointmentDetails.doctorInfo && appointmentDetails.doctorInfo.lastName
                  ? appointmentDetails.doctorInfo.lastName
                  : '';
              const doctorImage =
                appointmentDetails.doctorInfo && appointmentDetails.doctorInfo.photoUrl
                  ? appointmentDetails.doctorInfo.photoUrl
                  : require('images/ic_placeholder.png');
              const experience =
                appointmentDetails.doctorInfo && appointmentDetails.doctorInfo.experience
                  ? appointmentDetails.doctorInfo.experience
                  : '';
              const specialization =
                appointmentDetails.doctorInfo &&
                appointmentDetails.doctorInfo.specialty &&
                !_isNull(appointmentDetails.doctorInfo.specialty.name)
                  ? appointmentDetails.doctorInfo.specialty.name
                  : '';
              const currentTime = new Date().getTime();
              const appointmentTime = new Date(appointmentDetails.appointmentDateTime).getTime();
              const difference = Math.round((appointmentTime - currentTime) / 60000);
              shouldRefreshComponent(difference);
              const doctorId =
                appointmentDetails.doctorInfo && appointmentDetails.doctorId
                  ? appointmentDetails.doctorId
                  : '';
              return (
                <Grid item sm={6} key={index}>
                  <div
                    className={classes.consultCard}
                    role="button"
                    onClick={() => {
                      addConsultToQueue({
                        variables: {
                          appointmentId,
                        },
                      })
                        .then((res) => {
                          window.location.href = clientRoutes.chatRoom(appointmentId, doctorId);
                        })
                        .catch((e: ApolloError) => {
                          console.log(e);
                        });
                    }}
                  >
                    <div className={classes.consultCardWrap}>
                      <div className={classes.startDoctor}>
                        <Avatar alt="" src={doctorImage} className={classes.doctorAvatar} />
                        {appointmentDetails.doctorInfo &&
                        appointmentDetails.doctorInfo.doctorType === DoctorType.STAR_APOLLO ? (
                          <span>
                            <img src={require('images/ic_star.svg')} alt="" />
                          </span>
                        ) : null}
                      </div>
                      <div className={classes.doctorInfo}>
                        <div
                          className={`${classes.availability} ${
                            difference <= 15 ? classes.availableNow : ''
                          }`}
                        >
                          {difference <= 15
                            ? `Available in ${difference} mins`
                            : otherDateMarkup(appointmentTime)}
                        </div>
                        <div className={classes.doctorName}>{`Dr. ${_startCase(
                          _toLower(firstName)
                        )} ${_startCase(_toLower(lastName))}`}</div>
                        <div className={classes.doctorType}>
                          {specialization}
                          <span className={classes.doctorExp}>{experience} YRS</span>
                        </div>
                        <div className={classes.consultaitonType}>
                          <span>
                            {appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE
                              ? 'Online Consultation'
                              : 'Clinic Visit'}
                          </span>
                          <span>
                            {appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE ? (
                              <img src={require('images/ic_onlineconsult.svg')} alt="" />
                            ) : (
                              <img src={require('images/ic_clinicvisit.svg')} alt="" />
                            )}
                          </span>
                        </div>
                        <div className={classes.appointBooked}>
                          <ul>
                            <li>Fever</li>
                            <li>Cough &amp; Cold</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className={classes.cardBottomActons}>
                      <AphButton
                        onClick={() => {
                          addConsultToQueue({
                            variables: {
                              appointmentId,
                            },
                          })
                            .then((res) => {
                              window.location.href = clientRoutes.chatRoom(appointmentId, doctorId);
                            })
                            .catch((e: ApolloError) => {
                              console.log(e);
                            });
                        }}
                      >
                        Start Consult
                      </AphButton>
                      <div className={classes.noteText}>You are entitled to 1 free follow-up!</div>
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </Scrollbars>
    </div>
  );
};
