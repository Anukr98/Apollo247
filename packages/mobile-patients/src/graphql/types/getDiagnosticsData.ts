/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticsData
// ====================================================

export interface getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  gender: string;
  rate: number;
  itemRemarks: string;
  city: string;
  state: string;
  itemType: DIAGNOSTICS_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testPreparationData: string;
  collectionType: TEST_COLLECTION_TYPE | null;
}

export interface getDiagnosticsData_getDiagnosticsData_diagnosticOrgans {
  __typename: "DiagnosticOrgans";
  id: string;
  organName: string | null;
  organImage: string | null;
  diagnostics: getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics | null;
}

export interface getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  gender: string;
  rate: number;
  itemRemarks: string;
  city: string;
  state: string;
  itemType: DIAGNOSTICS_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testPreparationData: string;
  collectionType: TEST_COLLECTION_TYPE | null;
}

export interface getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers {
  __typename: "DiagnosticHotSellers";
  id: string;
  packageName: string | null;
  price: number | null;
  packageImage: string | null;
  diagnostics: getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers_diagnostics | null;
}

export interface getDiagnosticsData_getDiagnosticsData {
  __typename: "DiagnosticsData";
  diagnosticOrgans: (getDiagnosticsData_getDiagnosticsData_diagnosticOrgans | null)[] | null;
  diagnosticHotSellers: (getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers | null)[] | null;
}

export interface getDiagnosticsData {
  getDiagnosticsData: getDiagnosticsData_getDiagnosticsData;
}
