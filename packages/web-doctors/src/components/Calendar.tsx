import React, { useState } from 'react';
import { CalendarStrip } from 'components/Calendar/CalendarStrip';
import { Appointments } from 'components/Appointments';
import { addMinutes, startOfDay, getTime } from 'date-fns';

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

  const onDayClick = (e, date) => {
    if (getTime(startOfDay(date)) === getTime(startOfDay(Date.now()))) {
      return setAppointments(dummyData);
    }

    setAppointments([]);
  };

  return (
    <div style={{ background: "black" }}>
      <CalendarStrip
        dayClickHandler={onDayClick}
      />
      <Appointments
        values={appointments}
      />
    </div >
  );
}
