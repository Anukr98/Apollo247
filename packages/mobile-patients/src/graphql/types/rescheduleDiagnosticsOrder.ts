/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RescheduleDiagnosticsInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: rescheduleDiagnosticsOrder
// ====================================================

export interface rescheduleDiagnosticsOrder_rescheduleDiagnosticsOrder {
  __typename: "RescheduleDiagnosticsOrderResponse";
  status: string;
  rescheduleCount: number;
  message: string;
}

export interface rescheduleDiagnosticsOrder {
  rescheduleDiagnosticsOrder: rescheduleDiagnosticsOrder_rescheduleDiagnosticsOrder | null;
}

export interface rescheduleDiagnosticsOrderVariables {
  rescheduleDiagnosticsInput?: RescheduleDiagnosticsInput | null;
}
