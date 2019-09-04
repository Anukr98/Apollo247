/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: searchDiagnosis
// ====================================================

export interface searchDiagnosis_searchDiagnosis {
  __typename: "DiagnosisJson";
  name: string | null;
  id: string | null;
}

export interface searchDiagnosis {
  searchDiagnosis: (searchDiagnosis_searchDiagnosis | null)[] | null;
}

export interface searchDiagnosisVariables {
  searchString: string;
}
