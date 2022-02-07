/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { recommendationInputItem } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticPackageRecommendationsv2
// ====================================================

export interface getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations_diagnosticInclusions_observations {
  __typename: "Observation";
  observationName: string | null;
  mandatoryValue: string | null;
}

export interface getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations_diagnosticInclusions {
  __typename: "DiagnosticInclusions";
  itemId: number;
  name: string;
  observations: (getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations_diagnosticInclusions_observations | null)[] | null;
}

export interface getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations {
  __typename: "Diagnostics";
  itemId: number;
  itemName: string;
  gender: string;
  inclusions: (number | null)[] | null;
  packageCalculatedMrp: number | null;
  diagnosticInclusions: (getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations_diagnosticInclusions | null)[] | null;
  diagnosticPricing: (getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2 {
  __typename: "getDiagnosticPackageRecommendationsResult";
  packageRecommendations: (getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2_packageRecommendations | null)[] | null;
}

export interface getDiagnosticPackageRecommendationsv2 {
  getDiagnosticPackageRecommendationsv2: getDiagnosticPackageRecommendationsv2_getDiagnosticPackageRecommendationsv2 | null;
}

export interface getDiagnosticPackageRecommendationsv2Variables {
  recommendationInputItems: (recommendationInputItem | null)[];
  cityId: number;
}
