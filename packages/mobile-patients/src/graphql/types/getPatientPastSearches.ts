/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SEARCH_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientPastSearches
// ====================================================

export interface getPatientPastSearches_getPatientPastSearches {
  __typename: "SearchData";
  searchType: SEARCH_TYPE | null;
  typeId: string | null;
  name: string | null;
  image: string | null;
  specialty: string | null;
  symptoms: string | null;
  allowBookingRequest: boolean | null;
}

export interface getPatientPastSearches {
  getPatientPastSearches: (getPatientPastSearches_getPatientPastSearches | null)[];
}

export interface getPatientPastSearchesVariables {
  patientId: string;
}
