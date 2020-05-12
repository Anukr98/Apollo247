/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDiagnostics
// ====================================================

export interface SearchDiagnostics_searchDiagnostics_diagnostics {
  __typename: "Diagnostics";
  itemName: string;
}

export interface SearchDiagnostics_searchDiagnostics {
  __typename: "SearchDiagnosticsResult";
  diagnostics: (SearchDiagnostics_searchDiagnostics_diagnostics | null)[] | null;
}

export interface SearchDiagnostics {
  searchDiagnostics: SearchDiagnostics_searchDiagnostics;
}

export interface SearchDiagnosticsVariables {
  city?: string | null;
  patientId?: string | null;
  searchText: string;
}
