/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { saveModifyDiagnosticOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveModifyDiagnosticOrder
// ====================================================

export interface saveModifyDiagnosticOrder_saveModifyDiagnosticOrder_attributes {
  __typename: "CustomResponse";
  itemids: string | null;
}

export interface saveModifyDiagnosticOrder_saveModifyDiagnosticOrder {
  __typename: "saveModifyDiagnosticOrderResponse";
  orderId: string | null;
  displayId: string | null;
  status: boolean | null;
  errorMessageToDisplay: string | null;
  attributes: saveModifyDiagnosticOrder_saveModifyDiagnosticOrder_attributes | null;
}

export interface saveModifyDiagnosticOrder {
  saveModifyDiagnosticOrder: saveModifyDiagnosticOrder_saveModifyDiagnosticOrder;
}

export interface saveModifyDiagnosticOrderVariables {
  saveModifyDiagnosticOrder: saveModifyDiagnosticOrderInput;
}
