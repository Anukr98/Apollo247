/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTICS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrdersList
// ====================================================

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  itemType: DIAGNOSTICS_TYPE | null;
  testPreparationData: string;
  groupPlan: string;
  diagnosticPricing: (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing | null)[] | null;
  testDescription: string | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  id: string;
  itemId: number | null;
  quantity: number | null;
  price: number | null;
  diagnostics: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList {
  __typename: "DiagnosticOrders";
  id: string;
  patientAddressId: string;
  city: string;
  slotTimings: string;
  employeeSlotId: string;
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
  diagnosticOrderLineItems: (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems | null)[] | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList {
  __typename: "DiagnosticOrdersResult";
  ordersList: (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList | null)[] | null;
}

export interface getDiagnosticOrdersList {
  getDiagnosticOrdersList: getDiagnosticOrdersList_getDiagnosticOrdersList;
}

export interface getDiagnosticOrdersListVariables {
  patientId?: string | null;
}
