import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {
  GetPatientAppointments,
  GetPatientAppointments_getPatinetAppointments_patinetAppointments as appointmentDetails,
} from 'graphql/types/GetPatientAppointments';
import { APPOINTMENT_TYPE, DoctorType } from 'graphql/types/globalTypes';
import _isNull from 'lodash/isNull';
import { Link } from 'react-router-dom';
import { getTime } from 'date-fns/esm';
import { format } from 'date-fns';

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
      display: 'flex',
      padding: 16,
      position: 'relative',
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
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 8,
      paddingTop: 5,
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
  };
});

interface ConsultationsCardProps {
  appointments: GetPatientAppointments;
}

const getTimestamp = (today: Date, slotTime: string) => {
  const hhmm = slotTime.split(':');
  return getTime(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hhmm[0], 10),
      parseInt(hhmm[1], 10),
      0,
      0
    )
  );
};

export const ConsultationsCard: React.FC<ConsultationsCardProps> = (props) => {
  const classes = useStyles();

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
    const aptArray = appointmentDetails.appointmentDateTime.split('T');
    const appointmentTime = getTimestamp(
      new Date(appointmentDetails.appointmentDateTime),
      aptArray[1].substring(0, 5)
    );
    if (
      appointmentTime > currentTime &&
      appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE
    ) {
      return appointmentDetails;
    }
  });

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 214px)'}>
        <div className={classes.consultationSection}>
          <Grid container spacing={2}>
            {filterAppointments.map((appointmentDetails, index) => {
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
                appointmentDetails.doctorInfo.specialization &&
                !_isNull(appointmentDetails.doctorInfo.specialization)
                  ? appointmentDetails.doctorInfo.specialization
                  : '';
              const currentTime = new Date().getTime();
              const aptArray = appointmentDetails.appointmentDateTime.split('T');
              const appointmentTime = getTimestamp(
                new Date(appointmentDetails.appointmentDateTime),
                aptArray[1].substring(0, 5)
              );
              const difference = Math.round((appointmentTime - currentTime) / 60000);
              return (
                <Grid item sm={6} key={index}>
                  <Link to="">
                    <div className={classes.consultCard}>
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
                            : `${format(new Date(appointmentTime), 'h:m a')}`}
                        </div>
                        <div className={classes.doctorName}>{`${firstName} ${lastName}`}</div>
                        <div className={classes.doctorType}>
                          {specialization}
                          <span className={classes.doctorExp}>{experience} YRS</span>
                        </div>
                        <div className={classes.consultaitonType}>Online Consultation</div>
                        <div className={classes.appointBooked}>
                          <ul>
                            <li>Fever</li>
                            <li>Cough &amp; Cold</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </Scrollbars>
    </div>
  );
};
