/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOpenOrdersList
// ====================================================

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders {
  __typename: "DiagnosticOrders";
  id: string;
  patientId: string;
  paymentOrderId: string | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  slotDateTimeInUTC: any | null;
  labReportURL: string | null;
}

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList {
  __typename: "DiagnosticOpenOrdersResult";
  openOrders: (getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders | null)[] | null;
}

export interface getDiagnosticOpenOrdersList {
  getDiagnosticOpenOrdersList: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList;
}

export interface getDiagnosticOpenOrdersListVariables {
  patientId: string;
  skip: number;
  take: number;
}
