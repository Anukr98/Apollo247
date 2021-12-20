/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticItemRecommendationsByPastOrders
// ====================================================

export interface getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders_itemsData_diagnosticInclusions_observations {
  __typename: "Observation";
  observationName: string | null;
  mandatoryValue: string | null;
}

export interface getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders_itemsData_diagnosticInclusions {
  __typename: "DiagnosticInclusions";
  observations: (getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders_itemsData_diagnosticInclusions_observations | null)[] | null;
}

export interface getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders_itemsData {
  __typename: "AffinityData";
  itemId: number;
  itemName: string;
  diagnosticInclusions: (getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders_itemsData_diagnosticInclusions | null)[] | null;
}

export interface getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders {
  __typename: "itemRecommendation";
  itemsData: (getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders_itemsData | null)[] | null;
}

export interface getDiagnosticItemRecommendationsByPastOrders {
  getDiagnosticItemRecommendationsByPastOrders: getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders | null;
}

export interface getDiagnosticItemRecommendationsByPastOrdersVariables {
  mobileNumber: string;
}
