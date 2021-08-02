/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CancelAppointmentInput, STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: cancelAppointment
// ====================================================

export interface cancelAppointment_cancelAppointment {
  __typename: "CancelAppointmentResult";
  status: STATUS | null;
}

export interface cancelAppointment {
  cancelAppointment: cancelAppointment_cancelAppointment;
}

export interface cancelAppointmentVariables {
  cancelAppointmentInput: CancelAppointmentInput;
}
