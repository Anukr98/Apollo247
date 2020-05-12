/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CancelAppointmentInput, STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CancelAppointment
// ====================================================

export interface CancelAppointment_cancelAppointment {
  __typename: "CancelAppointmentResult";
  status: STATUS | null;
}

export interface CancelAppointment {
  cancelAppointment: CancelAppointment_cancelAppointment;
}

export interface CancelAppointmentVariables {
  cancelAppointmentInput?: CancelAppointmentInput | null;
}
