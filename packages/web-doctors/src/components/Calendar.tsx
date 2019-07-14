import React, { useState } from 'react';
import { CalendarStrip } from 'components/Calendar/CalendarStrip';
import { Appointments } from 'components/Appointments';
import {
  addMinutes,
  startOfDay,
  getTime
} from 'date-fns';

export const Calendar: React.FC = () => {
  const dummyData = [{
    startTime: Date.now(),
    endTime: addMinutes(Date.now(), -1),
    details: {
      patientName: 'Prateek Sharma',
      checkups: ['Fever', 'Cough & Cold']
    },
    isNew: true,
    type: 'walkin'
  }, {
    startTime: Date.now(),
    endTime: addMinutes(Date.now(), 2),
    details: {
      patientName: 'George',
      checkups: ['Fever', 'Cough & Cold']
    },
    isNew: true,
    type: 'walkin'
  }];
  const [appointments, setAppointments] = useState(dummyData);

  const setData = (startOfWeekDate) => {
    if (getTime(startOfWeekDate) === getTime(startOfDay(Date.now())) || getTime(startOfWeekDate) === getTime(startOfDay(new Date(2019, 11, 1, 0, 0)))) {
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

  return (
    <div style={{ background: "black" }}>
      <CalendarStrip
        dayClickHandler={onDayClick}
        monthChangeHandler={onMonthChange}
        onNext={onNext}
        onPrev={onPrev}
      />
      <Appointments
        values={appointments}
      />
    </div >
  );
}
