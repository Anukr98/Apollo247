/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticsOrderStatus
// ====================================================

export interface getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList {
  __typename: "getDiagnosticsOrderStatusResponse";
  statusDate: any | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
  itemId: number | null;
  itemName: string | null;
  packageId: number | null;
  packageName: string | null;
}

export interface getDiagnosticsOrderStatus_getDiagnosticsOrderStatus {
  __typename: "DiagnosticOrderStatusResult";
  ordersList: (getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList | null)[] | null;
}

export interface getDiagnosticsOrderStatus {
  getDiagnosticsOrderStatus: getDiagnosticsOrderStatus_getDiagnosticsOrderStatus;
}

export interface getDiagnosticsOrderStatusVariables {
  diagnosticOrderId?: string | null;
}
