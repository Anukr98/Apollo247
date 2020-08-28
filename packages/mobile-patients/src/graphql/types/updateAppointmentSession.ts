/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateAppointmentSessionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateAppointmentSession
// ====================================================

export interface updateAppointmentSession_updateAppointmentSession {
  __typename: "AppointmentSession";
  sessionId: string;
  appointmentToken: string;
}

export interface updateAppointmentSession {
  updateAppointmentSession: updateAppointmentSession_updateAppointmentSession;
}

export interface updateAppointmentSessionVariables {
  UpdateAppointmentSessionInput?: UpdateAppointmentSessionInput | null;
}
