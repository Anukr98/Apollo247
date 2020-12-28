/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTICS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrdersList
// ====================================================

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  itemType: string | null;
  testPreparationData: string | null;
  packageCalculatedMrp: number | null;
  inclusions: (number | null)[] | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_pricingObj {
  __typename: "PricingObj";
  mrp: number | null;
  price: number | null;
  groupPlan: string | null;
}

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
  testDescription: string | null;
  diagnosticPricing: (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  id: string;
  itemId: number | null;
  itemName: string | null;
  quantity: number | null;
  price: number | null;
  groupPlan: string | null;
  itemType: DIAGNOSTICS_TYPE | null;
  itemObj: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_itemObj | null;
  pricingObj: (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_pricingObj | null)[] | null;
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
  areaId: number | null;
  slotDateTimeInUTC: any | null;
  rescheduleCount: number | null;
  isRescheduled: boolean | null;
  collectionCharges: number | null;
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
