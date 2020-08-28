/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateDiagnosticOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateDiagnosticOrder
// ====================================================

export interface updateDiagnosticOrder_updateDiagnosticOrder {
  __typename: "DiagnosticOrderCancelResult";
  message: string | null;
}

export interface updateDiagnosticOrder {
  updateDiagnosticOrder: updateDiagnosticOrder_updateDiagnosticOrder;
}

export interface updateDiagnosticOrderVariables {
  updateDiagnosticOrderInput?: UpdateDiagnosticOrderInput | null;
}
