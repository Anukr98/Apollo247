/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrderItem
// ====================================================

export interface getDiagnosticOrderItem_getDiagnosticOrderItem_diagnostics {
  __typename: "Diagnostics";
  itemName: string;
  rate: number;
  itemType: DIAGNOSTICS_TYPE | null;
  gender: string;
  itemRemarks: string;
  city: string;
  state: string;
  collectionType: TEST_COLLECTION_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testPreparationData: string;
  testDescription: string | null;
}

export interface getDiagnosticOrderItem_getDiagnosticOrderItem {
  __typename: "DiagnosticOrderItemResult";
  diagnostics: getDiagnosticOrderItem_getDiagnosticOrderItem_diagnostics | null;
}

export interface getDiagnosticOrderItem {
  getDiagnosticOrderItem: getDiagnosticOrderItem_getDiagnosticOrderItem;
}

export interface getDiagnosticOrderItemVariables {
  diagnosticOrderID: string;
  itemID: number;
}
