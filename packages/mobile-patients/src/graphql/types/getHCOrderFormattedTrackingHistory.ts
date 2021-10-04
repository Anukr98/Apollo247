/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getHCOrderFormattedTrackingHistory
// ====================================================

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_itemsModified {
  __typename: "itemStatusInfo";
  itemId: number | null;
  itemName: string | null;
  price: number | null;
  isRemoved: boolean | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_refund_items {
  __typename: "itemStatusInfo";
  itemId: number | null;
  itemName: string | null;
  price: number | null;
  isRemoved: boolean | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_refund {
  __typename: "DiagnosticRefundTracking";
  txnID: string | null;
  amount: number | null;
  status: string | null;
  reason: string | null;
  items: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_refund_items | null)[] | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes {
  __typename: "statusAttributes";
  itemsModified: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_itemsModified | null)[] | null;
  refund: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_refund | null)[] | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory {
  __typename: "formattedOrderStatus";
  statusDate: any | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
  subStatus: DIAGNOSTIC_ORDER_STATUS | null;
  attributes: getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions_inclusions {
  __typename: "PendingReportInclusion";
  itemId: number | null;
  itemName: string | null;
  packageId: number | null;
  packageName: string | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions {
  __typename: "GroupedPendingReportInclusion";
  inclusions: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions_inclusions | null)[] | null;
  isReportPending: boolean | null;
  reportTATMessage: string | null;
  expectedReportGenerationTime: any | null;
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

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_upcomingStatuses {
  __typename: "upcomingStatus";
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
}

export interface getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory {
  __typename: "HCOrderFormattedTrackingHistoryResult";
  statusHistory: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory | null)[] | null;
  groupedPendingReportInclusions: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions | null)[] | null;
  statusInclusions: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusInclusions | null)[] | null;
  upcomingStatuses: (getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_upcomingStatuses | null)[] | null;
}

export interface getHCOrderFormattedTrackingHistory {
  getHCOrderFormattedTrackingHistory: getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory;
}

export interface getHCOrderFormattedTrackingHistoryVariables {
  diagnosticOrderID?: string | null;
}
