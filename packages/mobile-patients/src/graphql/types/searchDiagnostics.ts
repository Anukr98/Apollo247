/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: searchDiagnostics
// ====================================================

export interface searchDiagnostics_searchDiagnostics_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  itemType: DIAGNOSTICS_TYPE | null;
  rate: number;
  gender: string;
  itemRemarks: string;
  city: string;
  state: string;
  collectionType: TEST_COLLECTION_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testPreparationData: string;
}

export interface searchDiagnostics_searchDiagnostics {
  __typename: "SearchDiagnosticsResult";
  diagnostics: (searchDiagnostics_searchDiagnostics_diagnostics | null)[] | null;
}

export interface searchDiagnostics {
  searchDiagnostics: searchDiagnostics_searchDiagnostics;
}

export interface searchDiagnosticsVariables {
  city?: string | null;
  patientId?: string | null;
  searchText: string;
}
