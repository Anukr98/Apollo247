/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ProcessDiagnosticHCOrderInputCOD } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: wrapperProcessDiagnosticHCOrderCOD
// ====================================================

export interface wrapperProcessDiagnosticHCOrderCOD_wrapperProcessDiagnosticHCOrderCOD_result {
  __typename: "processDiagnosticHCOrderResult";
  status: boolean | null;
  preBookingID: number | null;
  message: string | null;
}

export interface wrapperProcessDiagnosticHCOrderCOD_wrapperProcessDiagnosticHCOrderCOD {
  __typename: "ProcessMultipleDiagnosticOrderResult";
  result: (wrapperProcessDiagnosticHCOrderCOD_wrapperProcessDiagnosticHCOrderCOD_result | null)[] | null;
}

export interface wrapperProcessDiagnosticHCOrderCOD {
  wrapperProcessDiagnosticHCOrderCOD: wrapperProcessDiagnosticHCOrderCOD_wrapperProcessDiagnosticHCOrderCOD;
}

export interface wrapperProcessDiagnosticHCOrderCODVariables {
  processDiagnosticHCOrdersInput?: (ProcessDiagnosticHCOrderInputCOD | null)[] | null;
}
