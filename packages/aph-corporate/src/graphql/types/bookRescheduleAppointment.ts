/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BookRescheduleAppointmentInput, APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: bookRescheduleAppointment
// ====================================================

export interface bookRescheduleAppointment_bookRescheduleAppointment_appointmentDetails {
  __typename: "Appointment";
  appointmentType: APPOINTMENT_TYPE;
  id: string;
  doctorId: string;
  appointmentState: string | null;
  appointmentDateTime: any;
  status: STATUS;
  patientId: string;
  rescheduleCount: number;
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
