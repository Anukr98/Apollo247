import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { makeStyles } from '@material-ui/styles';
import {
  GetDoctorAppointments,
  GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
} from 'graphql/types/GetDoctorAppointments';
import { addMinutes, format } from 'date-fns/esm';

const useStyles = makeStyles(() => {
  return {
    calendarContainer: {
      backgroundColor: '#f7f7f7',
      padding: '15px',
      fontSize: 18,
      color: 'rgba(101, 143, 155, 0.6)',
      display: 'flex',
    },
    calenderIcon: {
      cursor: 'pointer',
      width: '7%',
      display: 'flex',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      height: 76,
      '& img': {
        margin: 'auto',
      },
    },
    moreIcon: {
      width: '7%',
      display: 'flex',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '-4px 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      height: 76,
      '& img': {
        margin: 'auto',
      },
    },
    monthView: {
      backgroundColor: '#fff',
      borderRadius: '10px',
      width: '80%',
      margin: 'auto',
      padding: 0,
      textAlign: 'center',
      boxShadow: '0px 2px 10px 0 rgba(0, 0, 0, 0.2)',
      height: 600,
      overflow: 'hidden',
      '& .rbc-toolbar': {
        backgroundColor: '#f7f7f7',
        padding: 24,
        color: '#02475b',
        marginBottom: 0,
      },
      '& .rbc-header': {
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 14,
        fontWeight: 500,
        padding: 25,
        borderColor: '#efefef transparent #efefef transparent',
      },
      '& .rbc-month-view': {
        height: '85%',
      },
      '& .rbc-date-cell a': {
        // pointerEvents: 'none',
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 14,
        paddingRight: 15,
        paddingTop: 8,
      },
      '& .rbc-off-range': {
        opacity: 0.5,
      },
      '& .rbc-current': {
        fontWeight: 700,
      },
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
    eventList = (data.getDoctorAppointments.appointmentsHistory || []).map(
      (appointment: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null) => {
        const { id, appointmentDateTime, patientInfo } = appointment!;
        const start = new Date(appointmentDateTime);
        return {
          id,
          title: `${format(start, 'hh:mm aa')} ${patientInfo!.firstName} ${patientInfo!.lastName}`,
          start,
          end: addMinutes(start, 15),
        };
      }
    );
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
    <div className={classes.calendarContainer}>
      <div
        className={classes.calenderIcon} >
        <img src={require('images/ic_calendar.svg')} alt="" />
      </div>
      <div className={classes.monthView}>
      <Calendar
        defaultDate={date}
        events={events}
        localizer={localizer}
        views={{ month: true }}
        onRangeChange={(range) => onMonthChange(range)}
      />
      </div>
      <div className={classes.moreIcon}>
        <img src={require('images/ic_more.svg')} alt="" />
      </div>
    </div>
  );
};
