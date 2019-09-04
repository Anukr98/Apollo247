/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDiagnosis
// ====================================================

export interface SearchDiagnosis_searchDiagnosis {
  __typename: "DiagnosisJson";
  name: string | null;
  id: string | null;
}

export interface SearchDiagnosis {
  searchDiagnosis: (SearchDiagnosis_searchDiagnosis | null)[] | null;
}

export interface SearchDiagnosisVariables {
  searchString: string;
}
