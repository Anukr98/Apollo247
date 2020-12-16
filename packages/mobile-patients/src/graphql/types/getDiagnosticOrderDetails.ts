/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrderDetails
// ====================================================

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_pricingObj {
  __typename: "PricingObj";
  mrp: number | null;
  price: number | null;
  groupPlan: string | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  gender: string;
  rate: number;
  itemRemarks: string;
  city: string;
  state: string;
  itemType: DIAGNOSTICS_TYPE | null;
  fromAgeInDays: number;
  collectionType: TEST_COLLECTION_TYPE | null;
  testDescription: string | null;
  packageCalculatedMrp: number | null;
  diagnosticPricing: (getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  id: string;
  itemId: number | null;
  price: number | null;
  quantity: number | null;
  groupPlan: string | null;
  pricingObj: (getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_pricingObj | null)[] | null;
  diagnostics: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_diagnostics | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrdersStatus {
  __typename: "DiagnosticOrdersStatus";
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
  itemId: number | null;
  statusDate: any | null;
  packageId: number | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList {
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
  diagnosticOrderLineItems: (getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems | null)[] | null;
  diagnosticOrdersStatus: (getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrdersStatus | null)[] | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails {
  __typename: "DiagnosticOrderResult";
  ordersList: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList | null;
}

export interface getDiagnosticOrderDetails {
  getDiagnosticOrderDetails: getDiagnosticOrderDetails_getDiagnosticOrderDetails;
}

export interface getDiagnosticOrderDetailsVariables {
  diagnosticOrderId?: string | null;
}
