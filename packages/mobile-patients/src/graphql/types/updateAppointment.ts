/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateAppointmentInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateAppointment
// ====================================================

export interface updateAppointment_updateAppointment {
  __typename: "UpdateAppointmentResult";
  error: string | null;
  status: boolean | null;
}

export interface updateAppointment {
  updateAppointment: updateAppointment_updateAppointment;
}

export interface updateAppointmentVariables {
  appointmentInput?: UpdateAppointmentInput | null;
}
