/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BookAppointmentInput, STATUS, APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: bookAppointment
// ====================================================

export interface bookAppointment_bookAppointment_appointment {
  __typename: "AppointmentBookingResult";
  id: string;
  doctorId: string;
  appointmentDateTime: any;
  status: STATUS;
  appointmentType: APPOINTMENT_TYPE;
  patientId: string;
  displayId: number;
  paymentOrderId: string | null;
}

export interface bookAppointment_bookAppointment {
  __typename: "BookAppointmentResult";
  appointment: bookAppointment_bookAppointment_appointment | null;
}

export interface bookAppointment {
  bookAppointment: bookAppointment_bookAppointment;
}

export interface bookAppointmentVariables {
  bookAppointment: BookAppointmentInput;
}
