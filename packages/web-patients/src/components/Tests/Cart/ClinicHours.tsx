import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    clinicWrapper: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: '12px 10px 8px 10px',
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginTop: 5,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 8,
      },
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      paddingBottom: 8,
      marginBottom: 9,
      '& img': {
        marginRight: 22,
      },
    },
    appointmentInfo: {
      marginTop: 9,
    },
    details: {
      display: 'flex',
      marginBottom: 4,
    },
    time: {
      marginLeft: 'auto',
    },
  };
});

type clinicHoursData = {
  week: string;
  time: string;
};

const clinicHours: clinicHoursData[] = [
  {
    week: 'Mon - Fri',
    time: '9:00 AM - 5:00 PM',
  },
  {
    week: 'Sat - Sun',
    time: '10:00 AM - 3:30 PM',
  },
];

export const ClinicHours: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.clinicWrapper}>
        <div className={classes.header}>
          <img src={require('images/ic_calendar_show.svg')} alt="" />
          <span>Clinic Hours</span>
        </div>
        <div className={classes.appointmentInfo}>
          {clinicHours.map((hours) => (
            <div className={classes.details}>
              <div>{hours.week}</div>
              <div className={classes.time}>{hours.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
