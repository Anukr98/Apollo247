/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SaveBookHomeCollectionOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveDiagnosticBookHCOrder
// ====================================================

export interface saveDiagnosticBookHCOrder_saveDiagnosticBookHCOrder_attributes {
  __typename: "CustomResponse";
  itemids: string | null;
}

export interface saveDiagnosticBookHCOrder_saveDiagnosticBookHCOrder {
  __typename: "saveBookHomeCollectionOrderResult";
  orderId: string | null;
  displayId: string | null;
  status: boolean | null;
  errorMessageToDisplay: string | null;
  attributes: saveDiagnosticBookHCOrder_saveDiagnosticBookHCOrder_attributes | null;
}

export interface saveDiagnosticBookHCOrder {
  saveDiagnosticBookHCOrder: saveDiagnosticBookHCOrder_saveDiagnosticBookHCOrder;
}

export interface saveDiagnosticBookHCOrderVariables {
  diagnosticOrderInput?: SaveBookHomeCollectionOrderInput | null;
}
