/* tslint:disable */
/* eslint-disable */
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
  gender: string;
  rate: number;
  itemRemarks: string;
  city: string;
  state: string;
  itemType: DIAGNOSTICS_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testPreparationData: string;
  collectionType: TEST_COLLECTION_TYPE | null;
}

export interface searchDiagnostics_searchDiagnostics {
  __typename: "SearchDiagnosticsResult";
  diagnostics: (searchDiagnostics_searchDiagnostics_diagnostics | null)[] | null;
}

export interface searchDiagnostics {
  searchDiagnostics: searchDiagnostics_searchDiagnostics;
}

export interface searchDiagnosticsVariables {
  searchText: string;
  patientId?: string | null;
  city?: string | null;
}
