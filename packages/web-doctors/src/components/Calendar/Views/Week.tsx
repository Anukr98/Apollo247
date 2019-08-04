import React, { useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CalendarStrip } from 'components/Calendar/CalendarStrip';
import { Appointments, Appointment } from 'components/Appointments';
import { addMinutes, startOfDay, getTime } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {
    calendarContainer: {
      backgroundColor: '#f7f7f7',
      padding: '15px',
      fontSize: 18,
      color: 'rgba(101, 143, 155, 0.6)',
    },
  };
});

export const Week: React.FC = () => {
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
  const [appointments, setAppointments] = useState<Appointment[]>(dummyData);

  const setData = (startOfWeekDate: Date) => {
    if (
      getTime(startOfWeekDate) === getTime(startOfDay(Date.now())) ||
      getTime(startOfWeekDate) === getTime(startOfDay(new Date(2019, 11, 1, 0, 0)))
    ) {
      return setAppointments(dummyData);
    }

    setAppointments([]);
  };

  const classes = useStyles();

  return (
    <div>
      <div className={classes.calendarContainer}>
        <CalendarStrip
          dayClickHandler={(e, date) => {
            setData(startOfDay(date));
          }}
          monthChangeHandler={(date) => {
            setData(startOfDay(date));
          }}
        />
      </div>

      <Appointments values={appointments} />
    </div>
  );
};
