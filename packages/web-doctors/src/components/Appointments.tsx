import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Typography } from '@material-ui/core';
import { format, getTime, setSeconds, setMilliseconds } from 'date-fns';

interface Props {
  values: Array<any>;
}

let timeOutId;
const udpateActiveStep = (appointments, activeStep, setActiveStep) => {
  if (appointments.length && checkIfComplete(appointments[activeStep].endTime)) {
    activeStep += 1;
    setActiveStep(activeStep);
  }

  if (activeStep < appointments.length) {
    timeOutId = setTimeout(() => udpateActiveStep(appointments, activeStep, setActiveStep), 1000);
  }
};
const checkIfComplete = (appointmentEndTime) =>
  getTime(setSeconds(setMilliseconds(appointmentEndTime, 0), 0)) <=
  getTime(setSeconds(setMilliseconds(Date.now(), 0), 0));

const getActiveStep = (appointments) =>
  appointments.findIndex((appointment) => checkIfComplete(appointment.endTime));

export const Appointments: React.FC<Props> = (props) => {
  const [appointments, setAppointments] = useState(props.values);
  const stepsCompleted = getActiveStep(appointments);
  const [activeStep, setActiveStep] = useState(stepsCompleted < 0 ? 0 : stepsCompleted);

  useEffect(() => {
    let activeStep = getActiveStep(props.values);
    activeStep = activeStep < 0 ? 0 : activeStep;

    setAppointments(props.values);
    setActiveStep(activeStep);
    clearTimeout(timeOutId);
    udpateActiveStep(props.values, activeStep, setActiveStep);
  }, [props.values]);

  return (
    <div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {appointments.map((appointment, idx) => (
          <Step key={idx}>
            <StepLabel>
              <Typography>
                {format(appointment.startTime, 'hh:mm')} - {format(appointment.endTime, 'hh:mm A')}
                <span>{appointment.details.patientName}</span>
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};
