/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: findDiagnosticsByItemIDsAndCityID
// ====================================================

export interface findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_observations {
  __typename: "Observation";
  observationName: string | null;
  mandatoryValue: string | null;
}

export interface findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_diagnosticInclusions_observations {
  __typename: "Observation";
  observationName: string | null;
  mandatoryValue: string | null;
}

export interface findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_diagnosticInclusions {
  __typename: "DiagnosticInclusions";
  name: string;
  itemId: number;
  observations: (findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_diagnosticInclusions_observations | null)[] | null;
}

export interface findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  itemType: DIAGNOSTICS_TYPE | null;
  rate: number;
  gender: string;
  imageUrl: string | null;
  itemRemarks: string;
  city: string;
  state: string;
  collectionType: TEST_COLLECTION_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testPreparationData: string;
  packageCalculatedMrp: number | null;
  testDescription: string | null;
  inclusions: (number | null)[] | null;
  diagnosticPricing: (findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_diagnosticPricing | null)[] | null;
  observations: (findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_observations | null)[] | null;
  diagnosticInclusions: (findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics_diagnosticInclusions | null)[] | null;
}

export interface findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID {
  __typename: "SearchDiagnosticsResult";
  diagnostics: (findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics | null)[] | null;
}

export interface findDiagnosticsByItemIDsAndCityID {
  findDiagnosticsByItemIDsAndCityID: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID;
}

export interface findDiagnosticsByItemIDsAndCityIDVariables {
  cityID: number;
  itemIDs: (number | null)[];
  pincode?: number | null;
}
