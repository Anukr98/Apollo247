/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDiagnostic
// ====================================================

export interface SearchDiagnostic_searchDiagnostic {
  __typename: "DiagnosticJson";
  itemid: string | null;
  itemname: string | null;
}

export interface SearchDiagnostic {
  searchDiagnostic: (SearchDiagnostic_searchDiagnostic | null)[] | null;
}

export interface SearchDiagnosticVariables {
  searchString: string;
}
