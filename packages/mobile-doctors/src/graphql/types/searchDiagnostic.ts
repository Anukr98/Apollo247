/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: searchDiagnostic
// ====================================================

export interface searchDiagnostic_searchDiagnostic {
  __typename: "DiagnosticJson";
  itemname: string | null;
}

export interface searchDiagnostic {
  searchDiagnostic: (searchDiagnostic_searchDiagnostic | null)[] | null;
}

export interface searchDiagnosticVariables {
  searchString: string;
}
