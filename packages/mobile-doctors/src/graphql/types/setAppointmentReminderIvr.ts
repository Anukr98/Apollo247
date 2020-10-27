/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ConsultMode } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: setAppointmentReminderIvr
// ====================================================

export interface setAppointmentReminderIvr_setAppointmentReminderIvr {
  __typename: "ivrResult";
  isError: boolean | null;
  response: string | null;
}

export interface setAppointmentReminderIvr {
  setAppointmentReminderIvr: setAppointmentReminderIvr_setAppointmentReminderIvr;
}

export interface setAppointmentReminderIvrVariables {
  doctorId: string;
  isIvrSet?: boolean | null;
  ivrConsultType?: ConsultMode | null;
  ivrCallTimeOnline?: number | null;
  ivrCallTimePhysical?: number | null;
}
