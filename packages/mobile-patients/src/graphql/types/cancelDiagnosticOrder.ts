/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: cancelDiagnosticOrder
// ====================================================

export interface cancelDiagnosticOrder_cancelDiagnosticOrder {
  __typename: "DiagnosticOrderCancelResult";
  message: string | null;
}

export interface cancelDiagnosticOrder {
  cancelDiagnosticOrder: cancelDiagnosticOrder_cancelDiagnosticOrder;
}

export interface cancelDiagnosticOrderVariables {
  diagnosticOrderId?: number | null;
}
