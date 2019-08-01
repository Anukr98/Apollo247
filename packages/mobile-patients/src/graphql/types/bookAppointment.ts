/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BookAppointmentInput, APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: bookAppointment
// ====================================================

export interface bookAppointment_bookAppointment_appointment {
  __typename: "Appointment";
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: any;
  appointmentTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
}

export interface bookAppointment_bookAppointment {
  __typename: "BookAppointmentResult";
  appointment: bookAppointment_bookAppointment_appointment | null;
}

export interface bookAppointment {
  bookAppointment: bookAppointment_bookAppointment;
}

export interface bookAppointmentVariables {
  appointmentInput: BookAppointmentInput;
}
