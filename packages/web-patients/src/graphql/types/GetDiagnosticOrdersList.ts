/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDiagnosticOrdersList
// ====================================================

export interface GetDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
}

export interface GetDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  id: string;
  itemId: number | null;
  quantity: number | null;
  price: number | null;
  diagnostics: GetDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics | null;
}

export interface GetDiagnosticOrdersList_getDiagnosticOrdersList_ordersList {
  __typename: "DiagnosticOrders";
  id: string;
  patientAddressId: string;
  city: string;
  slotTimings: string;
  employeeSlotId: number;
  diagnosticEmployeeCode: string;
  diagnosticBranchCode: string;
  totalPrice: number;
  prescriptionUrl: string;
  diagnosticDate: any;
  centerName: string;
  centerCode: string;
  centerCity: string;
  centerState: string;
  centerLocality: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  orderType: string;
  displayId: number;
  createdDate: any;
  diagnosticOrderLineItems: (GetDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems | null)[] | null;
}

export interface GetDiagnosticOrdersList_getDiagnosticOrdersList {
  __typename: "DiagnosticOrdersResult";
  ordersList: (GetDiagnosticOrdersList_getDiagnosticOrdersList_ordersList | null)[] | null;
}

export interface GetDiagnosticOrdersList {
  getDiagnosticOrdersList: GetDiagnosticOrdersList_getDiagnosticOrdersList;
}

export interface GetDiagnosticOrdersListVariables {
  patientId?: string | null;
}
