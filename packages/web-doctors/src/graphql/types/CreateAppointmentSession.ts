/* tslint:disable */
/* eslint-disable */
// @generated
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
}

export interface CreateAppointmentSession {
  createAppointmentSession: CreateAppointmentSession_createAppointmentSession;
}

export interface CreateAppointmentSessionVariables {
  createAppointmentSessionInput?: CreateAppointmentSessionInput | null;
}
