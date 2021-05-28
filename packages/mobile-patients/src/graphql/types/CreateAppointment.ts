/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateAppointmentInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateAppointment
// ====================================================

export interface CreateAppointment_CreateAppointment_response {
  __typename: "AppointmentType";
  display_id: number;
  id: string | null;
}

export interface CreateAppointment_CreateAppointment {
  __typename: "MutateAppointmentResponse";
  response: CreateAppointment_CreateAppointment_response | null;
  success: boolean;
  code: number;
  message: string | null;
}

export interface CreateAppointment {
  CreateAppointment: CreateAppointment_CreateAppointment;
}

export interface CreateAppointmentVariables {
  appointmentInput: CreateAppointmentInput;
}
