/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AppointmentBookingRequestInput, STATUS, APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: appointmentBookingRequest
// ====================================================

export interface appointmentBookingRequest_appointmentBookingRequest_appointment {
  __typename: "AppointmentBookingResult";
  id: string;
  doctorId: string;
  appointmentDateTime: any;
  status: STATUS;
  appointmentType: APPOINTMENT_TYPE;
  patientId: string;
}

export interface appointmentBookingRequest_appointmentBookingRequest {
  __typename: "BookAppointmentResult";
  appointment: appointmentBookingRequest_appointmentBookingRequest_appointment | null;
}

export interface appointmentBookingRequest {
  appointmentBookingRequest: appointmentBookingRequest_appointmentBookingRequest;
}

export interface appointmentBookingRequestVariables {
  bookAppointment: AppointmentBookingRequestInput;
}
