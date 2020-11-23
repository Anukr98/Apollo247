/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SEARCH_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientPastMedicineSearches
// ====================================================

export interface getPatientPastMedicineSearches_getPatientPastMedicineSearches {
  __typename: "SearchData";
  searchType: SEARCH_TYPE | null;
  typeId: string | null;
  name: string | null;
  image: string | null;
}

export interface getPatientPastMedicineSearches {
  getPatientPastMedicineSearches: (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[];
}

export interface getPatientPastMedicineSearchesVariables {
  patientId: string;
  type?: SEARCH_TYPE | null;
}
