/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticClosedOrdersList
// ====================================================

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders {
  __typename: "DiagnosticOrders";
  id: string;
  patientId: string;
  paymentOrderId: string | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  slotDateTimeInUTC: any | null;
  labReportURL: string | null;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
}

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList {
  __typename: "DiagnosticClosedOrdersResult";
  closedOrders: (getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders | null)[] | null;
}

export interface getDiagnosticClosedOrdersList {
  getDiagnosticClosedOrdersList: getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList;
}

export interface getDiagnosticClosedOrdersListVariables {
  patientId: string;
  skip: number;
  take: number;
}
