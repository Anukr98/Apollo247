import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { makeStyles } from '@material-ui/styles';
import { GetDoctorAppointments } from 'graphql/types/GetDoctorAppointments';
import { addMinutes } from 'date-fns/esm';

const useStyles = makeStyles(() => {
  return {
    container: {
      '& .rbc-date-cell a': {
        pointerEvents: 'none',
      },
      '& .rbc-current': {
        fontWeight: 'bold'
      },
      'min-height': 700,
      color: 'black',
      background: 'white',
      padding: 15,
    },
  };
});

interface MonthEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

const localizer = momentLocalizer(moment);
const eventsAdapter = (data: GetDoctorAppointments) => {
  let eventList: MonthEvent[] = [];

  if (data && data.getDoctorAppointments) {
    eventList = (data.getDoctorAppointments.appointmentsHistory || []).map((appointment) => {
      const { id, appointmentType: title, appointmentDateTime } = appointment;
      const start = new Date(appointmentDateTime);
      return {
        id,
        title,
        start,
        end: addMinutes(start, 15),
      };
    });
  }

  return eventList;
};

export interface MonthProps {
  data: GetDoctorAppointments;
  date: Date;
  onMonthChange: (range: Date[] | { start: string | Date; end: string | Date }) => void;
}

export const Month: React.FC<MonthProps> = ({ date, data, onMonthChange }) => {
  const classes = useStyles();
  const [events, setEvents] = useState<MonthEvent[]>(eventsAdapter(data));

  useEffect(() => {
    setEvents(eventsAdapter(data));
  }, [data]);

  return (
    <Calendar
      className={classes.container}
      defaultDate={date}
      events={events}
      localizer={localizer}
      views={{ month: true }}
      onRangeChange={(range) => onMonthChange(range)}
    />
  );
};
