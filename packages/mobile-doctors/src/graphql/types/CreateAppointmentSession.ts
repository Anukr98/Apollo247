/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CreateAppointmentSessionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateAppointmentSession
// ====================================================

export interface CreateAppointmentSession_createAppointmentSession {
  __typename: "CreateAppointmentSession";
  sessionId: string;
  appointmentToken: string;
  doctorId: string;
}

export interface CreateAppointmentSession {
  createAppointmentSession: CreateAppointmentSession_createAppointmentSession;
}

export interface CreateAppointmentSessionVariables {
  createAppointmentSessionInput?: CreateAppointmentSessionInput | null;
}
