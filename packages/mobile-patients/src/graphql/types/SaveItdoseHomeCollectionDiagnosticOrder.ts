/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DiagnosticOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveItdoseHomeCollectionDiagnosticOrder
// ====================================================

export interface SaveItdoseHomeCollectionDiagnosticOrder_SaveItdoseHomeCollectionDiagnosticOrder {
  __typename: "SaveDiagnosticOrderResult";
  errorCode: number | null;
  errorMessage: string | null;
  orderId: string | null;
  displayId: string | null;
}

export interface SaveItdoseHomeCollectionDiagnosticOrder {
  SaveItdoseHomeCollectionDiagnosticOrder: SaveItdoseHomeCollectionDiagnosticOrder_SaveItdoseHomeCollectionDiagnosticOrder;
}

export interface SaveItdoseHomeCollectionDiagnosticOrderVariables {
  diagnosticOrderInput?: DiagnosticOrderInput | null;
}
