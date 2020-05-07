/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SEARCH_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatientPastSearches
// ====================================================

export interface GetPatientPastSearches_getPatientPastSearches {
  __typename: "SearchData";
  searchType: SEARCH_TYPE | null;
  typeId: string | null;
  name: string | null;
  image: string | null;
}

export interface GetPatientPastSearches {
  getPatientPastSearches: (GetPatientPastSearches_getPatientPastSearches | null)[];
}

export interface GetPatientPastSearchesVariables {
  patientId: string;
}
