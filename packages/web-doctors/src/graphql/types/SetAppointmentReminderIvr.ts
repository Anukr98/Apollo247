/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConsultMode } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SetAppointmentReminderIvr
// ====================================================

export interface SetAppointmentReminderIvr_setAppointmentReminderIvr {
  __typename: "ivrResult";
  isError: boolean | null;
  response: string | null;
}

export interface SetAppointmentReminderIvr {
  setAppointmentReminderIvr: SetAppointmentReminderIvr_setAppointmentReminderIvr;
}

export interface SetAppointmentReminderIvrVariables {
  doctorId: string;
  isIvrSet?: boolean | null;
  ivrConsultType?: ConsultMode | null;
  ivrCallTimeOnline?: number | null;
  ivrCallTimePhysical?: number | null;
}
