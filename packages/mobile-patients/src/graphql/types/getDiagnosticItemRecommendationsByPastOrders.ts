/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticItemRecommendationsByPastOrders
// ====================================================

export interface getDiagnosticItemRecommendationsByPastOrders_getDiagnosticItemRecommendationsByPastOrders_itemsData {
  __typename: "AffinityData";
  itemId: number;
  itemName: string;
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
