/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ProcessDiagnosticHCOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: processDiagnosticHCOrder
// ====================================================

export interface processDiagnosticHCOrder_processDiagnosticHCOrder {
  __typename: "processDiagnosticHCOrderResult";
  status: boolean | null;
  preBookingID: number | null;
  message: string | null;
}

export interface processDiagnosticHCOrder {
  processDiagnosticHCOrder: processDiagnosticHCOrder_processDiagnosticHCOrder;
}

export interface processDiagnosticHCOrderVariables {
  processDiagnosticHCOrderInput?: ProcessDiagnosticHCOrderInput | null;
}
