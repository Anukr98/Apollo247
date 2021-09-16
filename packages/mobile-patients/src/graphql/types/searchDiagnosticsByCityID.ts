/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: searchDiagnosticsByCityID
// ====================================================

export interface searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  itemType: DIAGNOSTICS_TYPE | null;
  rate: number;
  gender: string;
  itemRemarks: string;
  city: string;
  state: string;
  collectionType: TEST_COLLECTION_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testDescription: string | null;
  testPreparationData: string;
  packageCalculatedMrp: number | null;
  inclusions: (number | null)[] | null;
  diagnosticPricing: (searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics_diagnosticPricing | null)[] | null;
}

export interface searchDiagnosticsByCityID_searchDiagnosticsByCityID {
  __typename: "SearchDiagnosticsResult";
  diagnostics: (searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics | null)[] | null;
}

export interface searchDiagnosticsByCityID {
  searchDiagnosticsByCityID: searchDiagnosticsByCityID_searchDiagnosticsByCityID;
}

export interface searchDiagnosticsByCityIDVariables {
  cityID: number;
  searchText: string;
}
