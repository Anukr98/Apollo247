/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BookRescheduleAppointmentInput, APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: bookRescheduleAppointment
// ====================================================

export interface bookRescheduleAppointment_bookRescheduleAppointment_appointmentDetails {
  __typename: "Appointment";
  appointmentType: APPOINTMENT_TYPE | null;
  id: string | null;
  doctorId: string | null;
  appointmentState: string | null;
  appointmentDateTime: any | null;
  status: STATUS | null;
  patientId: string | null;
}

export interface bookRescheduleAppointment_bookRescheduleAppointment {
  __typename: "BookRescheduleAppointmentResult";
  appointmentDetails: bookRescheduleAppointment_bookRescheduleAppointment_appointmentDetails | null;
}

export interface bookRescheduleAppointment {
  bookRescheduleAppointment: bookRescheduleAppointment_bookRescheduleAppointment;
}

export interface bookRescheduleAppointmentVariables {
  bookRescheduleAppointmentInput: BookRescheduleAppointmentInput;
}
