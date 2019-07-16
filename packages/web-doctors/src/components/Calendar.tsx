import React, { useState } from 'react';
import { BottomNavigation, Theme, Typography } from '@material-ui/core';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { CalendarStrip } from 'components/Calendar/CalendarStrip';
import { Appointments } from 'components/Appointments';
import { addMinutes, startOfDay, getTime } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
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

    tabHeading: {
      padding: '30px 40px 20px 40px',
      backgroundColor: theme.palette.secondary.contrastText,
      '& h1': {
        display: 'flex',
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 28,
        [theme.breakpoints.down('xs')]: {
          fontSize: 20,
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        margin: 0,
        [theme.breakpoints.down('xs')]: {
          fontSize: 15,
        },
      },
    },
    calendarContainer: {
      backgroundColor: '#f7f7f7',
      padding: '15px',
      fontSize: 18,
      color: 'rgba(101, 143, 155, 0.6)',
    },
  };
});

export const Calendar: React.FC = (props) => {
  const dummyData = [
    {
      startTime: Date.now(),
      endTime: addMinutes(Date.now(), -1),
      details: {
        patientName: 'Prateek Sharma',
        checkups: ['Fever', 'Cough & Cold'],
      },
      isNew: true,
      type: 'walkin',
    },
    {
      startTime: Date.now(),
      endTime: addMinutes(Date.now(), 2),
      details: {
        patientName: 'George',
        checkups: ['Fever', 'Cough & Cold'],
      },
      isNew: true,
      type: 'walkin',
    },
  ];
  const [appointments, setAppointments] = useState(dummyData);

  const setData = (startOfWeekDate) => {
    if (
      getTime(startOfWeekDate) === getTime(startOfDay(Date.now())) ||
      getTime(startOfWeekDate) === getTime(startOfDay(new Date(2019, 11, 1, 0, 0)))
    ) {
      return setAppointments(dummyData);
    }

    setAppointments([]);
  };

  const onDayClick = (e, date) => {
    setData(startOfDay(date));
  };

  const onMonthChange = (e, selectedMonth, startOfWeekDate) => {
    setData(startOfWeekDate);
  };

  const onNext = (e, date, startOfWeekDate) => {
    setData(startOfWeekDate);
  };

  const onPrev = (e, date, startOfWeekDate) => {
    setData(startOfWeekDate);
  };
  const classes = useStyles();

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.tabHeading}>
          <Typography variant="h1">hello dr.rao :)</Typography>
          <p>here’s your schedule for today</p>
        </div>
        <div style={{ background: 'black' }}>
          <div></div>
          <div className={classes.calendarContainer}>
            <CalendarStrip
              dayClickHandler={onDayClick}
              monthChangeHandler={onMonthChange}
              onNext={onNext}
              onPrev={onPrev}
            />
          </div>

          <Appointments values={appointments} />
        </div>
      </div>
    </div>
  );
};
