/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DiagnosticOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveDiagnosticOrder
// ====================================================

export interface SaveDiagnosticOrder_SaveDiagnosticOrder {
  __typename: "SaveDiagnosticOrderResult";
  errorCode: number | null;
  errorMessage: string | null;
  orderId: string | null;
  displayId: string | null;
}

export interface SaveDiagnosticOrder {
  SaveDiagnosticOrder: SaveDiagnosticOrder_SaveDiagnosticOrder;
}

export interface SaveDiagnosticOrderVariables {
  diagnosticOrderInput?: DiagnosticOrderInput | null;
}
