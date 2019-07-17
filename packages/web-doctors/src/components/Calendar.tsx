import React, { useState } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { CalendarStrip } from 'components/Calendar/CalendarStrip';
import { Appointments, Appointment } from 'components/Appointments';
import { addMinutes, startOfDay, getTime } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 68,
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

export const Calendar: React.FC = () => {
  const dummyData: Appointment[] = [
    {
      startTime: Date.now(),
      endTime: getTime(addMinutes(Date.now(), 1)),
      details: {
        patientName: 'Prateek Sharma',
        checkups: ['Fever', 'Cough & Cold', 'Nausea', 'Sore Eyes'],
        avatar:
          'https://images.unsplash.com/photo-1556909128-2293de4be38e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
      },
      isNew: true,
      type: 'walkin',
    },
    {
      startTime: getTime(addMinutes(Date.now(), 3)),
      endTime: getTime(addMinutes(Date.now(), 5)),
      details: {
        patientName: 'George',
        checkups: ['Fever', 'Cough & Cold', 'Nausea'],
        avatar:
          'https://images.unsplash.com/photo-1556909128-2293de4be38e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
      },
      isNew: false,
      type: 'walkin',
    },
    {
      startTime: getTime(addMinutes(Date.now(), 5)),
      endTime: getTime(addMinutes(Date.now(), 10)),
      details: {
        patientName: 'George',
        checkups: ['Fever', 'Cough & Cold', 'Nausea'],
        avatar:
          'https://images.unsplash.com/photo-1556909128-2293de4be38e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
      },
      isNew: false,
      type: 'walkin',
    },
    {
      startTime: getTime(addMinutes(Date.now(), 10)),
      endTime: getTime(addMinutes(Date.now(), 30)),
      details: {
        patientName: 'George',
        checkups: ['Fever', 'Cough & Cold', 'Nausea'],
        avatar:
          'https://images.unsplash.com/photo-1556909128-2293de4be38e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
      },
      isNew: false,
      type: 'walkin',
    },
  ];
  const [appointments, setAppointments] = useState(dummyData);

  const setData = (startOfWeekDate: Date) => {
    if (
      getTime(startOfWeekDate) === getTime(startOfDay(Date.now())) ||
      getTime(startOfWeekDate) === getTime(startOfDay(new Date(2019, 11, 1, 0, 0)))
    ) {
      return setAppointments(dummyData);
    }

    setAppointments([]);
  };

  const onDayClick = (e: React.MouseEvent, date: Date) => {
    setData(startOfDay(date));
  };

  const onMonthChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    selectedMonth: number,
    startOfWeekDate: Date
  ) => {
    setData(startOfWeekDate);
  };

  const onNext = (e: React.MouseEvent, date: Date, startOfWeekDate: Date) => {
    setData(startOfWeekDate);
  };

  const onPrev = (e: React.MouseEvent, date: Date, startOfWeekDate: Date) => {
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
