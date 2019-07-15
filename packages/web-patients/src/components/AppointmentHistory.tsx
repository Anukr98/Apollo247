import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import _uniqueId from 'lodash/uniqueId';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    bottomMenuRoot: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      bottom: 0,
      height: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
    },
    labelRoot: {
      width: '100%',
    },
    iconLabel: {
      fontSize: 12,
      color: '#67919d',
      paddingTop: 10,
      textTransform: 'uppercase',
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
  };
});

export const AppointmentHistory: React.FC = (props) => {
  const classes = useStyles();

  /* this should be a graphql call */
  const appointments = {
    someKey: {
      appointmentDate: '27 June 2019', // we need to yet know the format of this ts or string.
      appointmentTime: '06.30pm', // we need to yet identify how the time will come from api.
      symptoms: ['FEVER', 'COUGH & COLD'],
    },
    someKey1: {
      appointmentDate: '09 April 2019', // we need to yet know the format of this ts or string.
      appointmentTime: '03.00pm', // we need to yet identify how the time will come from api.
      symptoms: ['HEADACHE', 'SOAR THROAT'],
    },
  };

  return (
    <div className={classes.welcome}>
      <h1>Appointment History</h1> {/*this must be from either parent or here*/}
      {Object.values(appointments).map((appointment) => {
        return (
          <div key={_uniqueId('aphistory_')}>
            <div>{appointment.appointmentDate}</div>
            <div>{appointment.appointmentTime}</div>
            <div>
              {appointment.symptoms.map((symptom: string) => (
                <p>{symptom}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
