/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticsHomePageItems
// ====================================================

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans_diagnostics {
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
  testDescription: string | null;
  collectionType: TEST_COLLECTION_TYPE | null;
  inclusions: (number | null)[] | null;
  packageCalculatedMrp: number | null;
  diagnosticPricing: (getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans_diagnostics_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans {
  __typename: "DiagnosticOrgans";
  id: string;
  organName: string | null;
  organImage: string | null;
  diagnostics: getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans_diagnostics | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers_diagnostics {
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
  testDescription: string | null;
  collectionType: TEST_COLLECTION_TYPE | null;
  inclusions: (number | null)[] | null;
  packageCalculatedMrp: number | null;
  diagnosticPricing: (getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers_diagnostics_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers {
  __typename: "DiagnosticHotSellers";
  id: string;
  packageName: string | null;
  price: number | null;
  packageImage: string | null;
  diagnostics: getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers_diagnostics | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems {
  __typename: "DiagnosticsData";
  diagnosticOrgans: (getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans | null)[] | null;
  diagnosticHotSellers: (getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers | null)[] | null;
}

export interface getDiagnosticsHomePageItems {
  getDiagnosticsHomePageItems: getDiagnosticsHomePageItems_getDiagnosticsHomePageItems;
}

export interface getDiagnosticsHomePageItemsVariables {
  cityID: number;
}
