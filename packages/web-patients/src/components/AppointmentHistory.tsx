import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import _uniqueId from 'lodash/uniqueId';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      marginBottom: 10,
    },
    appointmentInfo: {
      padding: 20,
      clear: 'both',
    },
    appointDate: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    appointTime: {
      fontSize: 12,
      fontWeight: 500,
      color: '#0087ba',
    },
    appointType: {
      borderRadius: 10,
      backgroundColor: 'rgba(2,71,91,0.1)',
      padding: '6px 12px',
      minWidth: 116,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      color: '#02475b',
      float: 'right',
    },
    appointBooked: {
      borderTop: '1px solid rgba(1,71,91,0.3)',
      marginTop: 10,
      paddingTop: 5,
      '& ul': {
        padding: 0,
        margin: 0,
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
        },
      },
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
      appointmentType: 'Online Consult',
      symptoms: ['FEVER', 'COUGH & COLD'],
    },
    someKey1: {
      appointmentDate: '09 April 2019', // we need to yet know the format of this ts or string.
      appointmentTime: '03.00pm', // we need to yet identify how the time will come from api.
      appointmentType: 'Clinic Visit',
      symptoms: ['HEADACHE', 'SOAR THROAT'],
    },
  };

  return (
    <Grid container spacing={2}>
      {Object.values(appointments).map((appointment) => {
        return (
          <Grid item sm={3}>
            <div className={classes.root} key={_uniqueId('aphistory_')}>
              <div className={classes.appointType}>{appointment.appointmentType}</div>
              <div className={classes.appointmentInfo}>
                <div className={classes.appointDate}>{appointment.appointmentDate}</div>
                <div className={classes.appointTime}>{appointment.appointmentTime}</div>
                <div className={classes.appointBooked}>
                  <ul>
                    {appointment.symptoms.map((symptom: string) => (
                      <li key={_uniqueId('symptom_')}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );
};
