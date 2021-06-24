/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CancelAppointment
// ====================================================

export interface CancelAppointment_CancelAppointment_response {
  __typename: "AppointmentType";
  id: string | null;
  status: APPOINTMENT_STATUS;
}

export interface CancelAppointment_CancelAppointment {
  __typename: "MutateAppointmentResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: CancelAppointment_CancelAppointment_response | null;
}

export interface CancelAppointment {
  CancelAppointment: CancelAppointment_CancelAppointment;
}

export interface CancelAppointmentVariables {
  appointment_id?: string | null;
  display_id?: number | null;
}
