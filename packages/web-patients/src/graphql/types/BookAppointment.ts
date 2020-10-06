/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BookAppointmentInput, STATUS, APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BookAppointment
// ====================================================

export interface BookAppointment_bookAppointment_appointment {
  __typename: "AppointmentBookingResult";
  id: string;
  doctorId: string;
  appointmentDateTime: any;
  status: STATUS;
  appointmentType: APPOINTMENT_TYPE;
  patientId: string;
}

export interface BookAppointment_bookAppointment {
  __typename: "BookAppointmentResult";
  appointment: BookAppointment_bookAppointment_appointment | null;
}

export interface BookAppointment {
  bookAppointment: BookAppointment_bookAppointment;
}

export interface BookAppointmentVariables {
  bookAppointment: BookAppointmentInput;
}
