/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticPackageRecommendations
// ====================================================

export interface getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations_diagnosticInclusions_observations {
  __typename: "Observation";
  observationName: string | null;
  mandatoryValue: string | null;
}

export interface getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations_diagnosticInclusions {
  __typename: "DiagnosticInclusions";
  itemId: number;
  name: string;
  observations: (getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations_diagnosticInclusions_observations | null)[] | null;
}

export interface getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations {
  __typename: "Diagnostics";
  itemId: number;
  itemName: string;
  inclusions: (number | null)[] | null;
  packageCalculatedMrp: number | null;
  diagnosticInclusions: (getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations_diagnosticInclusions | null)[] | null;
  diagnosticPricing: (getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations {
  __typename: "getDiagnosticPackageRecommendationsResult";
  packageRecommendations: (getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations_packageRecommendations | null)[] | null;
}

export interface getDiagnosticPackageRecommendations {
  getDiagnosticPackageRecommendations: getDiagnosticPackageRecommendations_getDiagnosticPackageRecommendations | null;
}

export interface getDiagnosticPackageRecommendationsVariables {
  itemId: number;
  cityId: number;
}
