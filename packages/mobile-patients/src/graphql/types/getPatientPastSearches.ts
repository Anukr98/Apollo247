/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SEARCH_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientPastSearches
// ====================================================

export interface getPatientPastSearches_getPatientPastSearches_facility {
  __typename: "Facility";
  city: string | null;
  name: string;
}

export interface getPatientPastSearches_getPatientPastSearches {
  __typename: "SearchData";
  searchType: SEARCH_TYPE | null;
  typeId: string | null;
  name: string | null;
  image: string | null;
  languages: string | null;
  specialty: string | null;
  specialtyId: string | null;
  symptoms: string | null;
  allowBookingRequest: boolean | null;
  facility: getPatientPastSearches_getPatientPastSearches_facility | null;
  fee: number | null;
}

export interface getPatientPastSearches {
  getPatientPastSearches: (getPatientPastSearches_getPatientPastSearches | null)[];
}

export interface getPatientPastSearchesVariables {
  patientId: string;
}
