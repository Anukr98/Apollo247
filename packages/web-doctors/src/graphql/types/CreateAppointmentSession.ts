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
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  caseSheetId: string | null;
}

export interface CreateAppointmentSession {
  createAppointmentSession: CreateAppointmentSession_createAppointmentSession;
}

export interface CreateAppointmentSessionVariables {
  createAppointmentSessionInput?: CreateAppointmentSessionInput | null;
}
