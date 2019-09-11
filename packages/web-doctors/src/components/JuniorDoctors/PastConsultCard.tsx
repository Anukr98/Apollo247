import { Theme, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { format } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    title: {
      fontSize: 10,
      fontWeight: 600,
      lineHeight: 1.8,
      color: '#0087ba',
      paddingBottom: 5,
    },
    cardGroup: {
      backgroundColor: '#f7f7f7',
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 12,
      display: 'flex',
      cursor: 'pointer',
      marginBottom: 20,
      position: 'relative',
    },
    cardImg: {
      paddingRight: 12,
    },
    cardContent: {
      width: 'calc(100% - 74px)',
    },
    avatar: {
      width: 44,
      height: 44,
    },
    nameGroup: {
      display: 'flex',
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    name: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    consultType: {
      marginLeft: 'auto',
      cursor: 'pointer',
    },
    userId: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      paddingTop: 5,
      opacity: 0.6,
    },
    upnextTitle: {
      color: '#ff748e',
    },
    upNextCardGroup: {
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
    },
  };
});

export interface PastConsultCardProps {
  patient: {
    firstName: string;
    lastName: string;
    uhid?: string | null;
    photoUrl?: string | null;
  };
  appointment: {
    appointmentDateTime: Date;
    appointmentType?: APPOINTMENT_TYPE | null;
  };
}
export const PastConsultCard: React.FC<PastConsultCardProps> = (props) => {
  const classes = useStyles();
  const { patient, appointment } = props;

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        APPT DATE: {format(appointment.appointmentDateTime, 'Pp')}
      </div>
      <div className={classes.cardGroup}>
        <div className={classes.cardImg}>
          {patient.photoUrl ? (
            <Avatar src={patient.photoUrl} className={classes.avatar} />
          ) : (
            <Avatar className={classes.avatar}>
              {patient.firstName.charAt(0)}
              {patient.lastName.charAt(0)}
            </Avatar>
          )}
        </div>
        <div className={classes.cardContent}>
          <div className={classes.nameGroup}>
            <div className={classes.name}>
              {patient.firstName} {patient.lastName}
            </div>
            <div className={classes.consultType}>
              {appointment.appointmentType === APPOINTMENT_TYPE.ONLINE && (
                <img src={require('images/ic_round-video.svg')} alt="" />
              )}
              {appointment.appointmentType === APPOINTMENT_TYPE.PHYSICAL && (
                <img src={require('images/ic_round-clinic.svg')} alt="" />
              )}
            </div>
          </div>
          <div className={classes.userId}>UHID: {patient.uhid}</div>
        </div>
      </div>
    </div>
  );
};
