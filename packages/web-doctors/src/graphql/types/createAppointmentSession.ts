/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CreateAppointmentSessionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateAppointmentSession
// ====================================================

export interface CreateAppointmentSession_createAppointmentSession {
  __typename: "AppointmentSession";
  sessionId: string;
  appointmentToken: string;
}

export interface CreateAppointmentSession {
  createAppointmentSession: CreateAppointmentSession_createAppointmentSession;
}

export interface CreateAppointmentSessionVariables {
  CreateAppointmentSessionInput?: CreateAppointmentSessionInput | null;
}
