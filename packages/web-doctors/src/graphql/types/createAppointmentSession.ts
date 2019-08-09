/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CreateAppointmentSessionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: createAppointmentSession
// ====================================================

export interface createAppointmentSession_createAppointmentSession {
  __typename: "AppointmentSession";
  sessionId: string;
  appointmentToken: string;
}

export interface createAppointmentSession {
  createAppointmentSession: createAppointmentSession_createAppointmentSession;
}

export interface createAppointmentSessionVariables {
  CreateAppointmentSessionInput?: CreateAppointmentSessionInput | null;
}
