/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdateAppointmentSessionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateAppointmentSession
// ====================================================

export interface UpdateAppointmentSession_updateAppointmentSession {
  __typename: "AppointmentSession";
  sessionId: string;
  appointmentToken: string;
}

export interface UpdateAppointmentSession {
  updateAppointmentSession: UpdateAppointmentSession_updateAppointmentSession;
}

export interface UpdateAppointmentSessionVariables {
  UpdateAppointmentSessionInput?: UpdateAppointmentSessionInput | null;
}
