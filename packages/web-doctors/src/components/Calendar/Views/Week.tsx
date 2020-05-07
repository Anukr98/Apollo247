import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CalendarStrip } from 'components/Calendar/CalendarStrip';
import { Appointments, Appointment } from 'components/Appointments';

const useStyles = makeStyles((theme: Theme) => {
  return {
    calendarContainer: {
      backgroundColor: '#f7f7f7',
      padding: '15px',
      fontSize: 18,
      color: 'rgba(101, 143, 155, 0.6)',
      position: 'sticky',
      top: 0,
      zIndex: 99,
      [theme.breakpoints.down('xs')]: {
        padding: '15px 0',
      },
    },
  };
});

export interface WeekProps {
  date: Date;
  data: Appointment[];
  onDaySelection: (date: Date) => void;
  loading: boolean;
}

export const Week: React.FC<WeekProps> = ({ date, data, onDaySelection, loading: loadingData }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(data);
  const [loading, isLoading] = useState<boolean>(loadingData);

  useEffect(() => {
    setAppointments(data);
  }, [data]);

  useEffect(() => {
    isLoading(loadingData);
  }, [loadingData]);

  const classes = useStyles({});

  return (
    <div>
      <div className={classes.calendarContainer}>
        <CalendarStrip
          date={date}
          dayClickHandler={(date) => {
            onDaySelection(date);
          }}
          monthChangeHandler={(date) => {
            onDaySelection(date);
          }}
        />
      </div>

      <Appointments values={appointments} loading={loading} selectedDate={date} />
    </div>
  );
};
