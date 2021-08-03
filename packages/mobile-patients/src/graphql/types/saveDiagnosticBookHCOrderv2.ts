/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SaveBookHomeCollectionOrderInputv2 } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveDiagnosticBookHCOrderv2
// ====================================================

export interface saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs_attributes_conflictedItems {
  __typename: "conflictedItems";
  itemToKeep: (number | null)[] | null;
  itemsWithConflicts: (number | null)[] | null;
}

export interface saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs_attributes {
  __typename: "CustomResponse";
  itemids: string | null;
  conflictedItems: (saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs_attributes_conflictedItems | null)[] | null;
}

export interface saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs {
  __typename: "patientsObjWithOrderID";
  status: boolean;
  orderID: string | null;
  patientID: string;
  amount: number | null;
  errorMessageToDisplay: string | null;
  displayID: number | null;
  attributes: saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs_attributes | null;
}

export interface saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2 {
  __typename: "SaveBookHomeCollectionOrderResultv2";
  patientsObjWithOrderIDs: (saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2_patientsObjWithOrderIDs | null)[] | null;
}

export interface saveDiagnosticBookHCOrderv2 {
  saveDiagnosticBookHCOrderv2: saveDiagnosticBookHCOrderv2_saveDiagnosticBookHCOrderv2;
}

export interface saveDiagnosticBookHCOrderv2Variables {
  diagnosticOrderInput?: SaveBookHomeCollectionOrderInputv2 | null;
}
