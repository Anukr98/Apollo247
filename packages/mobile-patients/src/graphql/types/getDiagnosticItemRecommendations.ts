/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: getDiagnosticItemRecommendations
// ====================================================

export interface getDiagnosticItemRecommendations_getDiagnosticItemRecommendations_itemsData_observations {
  __typename: "Observation";
  observationName: string | null;
  mandatoryValue: string | null;
}

export interface getDiagnosticItemRecommendations_getDiagnosticItemRecommendations_itemsData {
  __typename: "AffinityData";
  itemId: number;
  itemName: string;
  combinedLift: number;
  observations: (getDiagnosticItemRecommendations_getDiagnosticItemRecommendations_itemsData_observations | null)[] | null;
}

export interface getDiagnosticItemRecommendations_getDiagnosticItemRecommendations {
  __typename: "itemRecommendation";
  itemsData: (getDiagnosticItemRecommendations_getDiagnosticItemRecommendations_itemsData | null)[] | null;
}

export interface getDiagnosticItemRecommendations {
  getDiagnosticItemRecommendations: getDiagnosticItemRecommendations_getDiagnosticItemRecommendations | null;
}

export interface getDiagnosticItemRecommendationsVariables {
  itemIds: (number | null)[];
  records?: number | null;
}
