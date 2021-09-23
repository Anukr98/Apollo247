/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { saveModifyDiagnosticOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveModifyDiagnosticOrder
// ====================================================

export interface saveModifyDiagnosticOrder_saveModifyDiagnosticOrder_attributes_conflictedItems {
  __typename: "conflictedItems";
  itemToKeep: (number | null)[] | null;
  itemsWithConflicts: (number | null)[] | null;
}

export interface saveModifyDiagnosticOrder_saveModifyDiagnosticOrder_attributes {
  __typename: "CustomResponse";
  itemids: string | null;
  conflictedItems: (saveModifyDiagnosticOrder_saveModifyDiagnosticOrder_attributes_conflictedItems | null)[] | null;
  refreshCart: boolean | null;
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
