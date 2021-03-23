/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getHCOrderFormattedTrackingHistory
// ====================================================

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory {
  __typename: "formattedOrderStatus";
  statusDate: any | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusInclusions {
  __typename: "DiagnosticOrdersStatus";
  statusDate: any | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
  itemId: number | null;
  packageId: number | null;
  itemName: string | null;
  packageName: string | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory {
  __typename: "HCOrderFormattedTrackingHistoryResult";
  statusHistory: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory | null)[] | null;
  statusInclusions: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusInclusions | null)[] | null;
}

export interface getHCOrderFormattedTrackingHistory {
  getHCOrderFormattedTrackingHistory: getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory;
}

export interface getHCOrderFormattedTrackingHistoryVariables {
  diagnosticOrderID?: string | null;
}
