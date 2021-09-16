/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticCancelledOrderDetails
// ====================================================

export interface getDiagnosticCancelledOrderDetails_getDiagnosticCancelledOrderDetails_ordersList {
  __typename: "getDiagnosticsOrderStatusResponse";
  statusDate: any | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
  itemId: number | null;
  itemName: string | null;
  packageId: number | null;
  packageName: string | null;
}

export interface getDiagnosticCancelledOrderDetails_getDiagnosticCancelledOrderDetails {
  __typename: "DiagnosticOrderStatusResult";
  ordersList: (getDiagnosticCancelledOrderDetails_getDiagnosticCancelledOrderDetails_ordersList | null)[] | null;
}

export interface getDiagnosticCancelledOrderDetails {
  getDiagnosticCancelledOrderDetails: getDiagnosticCancelledOrderDetails_getDiagnosticCancelledOrderDetails;
}

export interface getDiagnosticCancelledOrderDetailsVariables {
  diagnosticOrderId?: string | null;
  patientId?: string | null;
}
