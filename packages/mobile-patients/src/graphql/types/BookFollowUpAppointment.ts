/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BookFollowUpAppointmentInput, APPOINTMENT_TYPE, APPOINTMENT_STATE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BookFollowUpAppointment
// ====================================================

export interface BookFollowUpAppointment_bookFollowUpAppointment_appointment {
  __typename: "FollowUpAppointmentBooking";
  id: string;
  isFollowUp: number | null;
  doctorId: string;
  appointmentType: APPOINTMENT_TYPE;
  appointmentState: APPOINTMENT_STATE | null;
  appointmentDateTime: any;
  patientId: string;
  status: STATUS;
}

export interface BookFollowUpAppointment_bookFollowUpAppointment {
  __typename: "BookFollowUpAppointmentResult";
  appointment: BookFollowUpAppointment_bookFollowUpAppointment_appointment | null;
}

export interface BookFollowUpAppointment {
  bookFollowUpAppointment: BookFollowUpAppointment_bookFollowUpAppointment;
}

export interface BookFollowUpAppointmentVariables {
  followUpAppointmentInput: BookFollowUpAppointmentInput;
}
