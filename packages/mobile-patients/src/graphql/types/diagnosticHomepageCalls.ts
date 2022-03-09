/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: diagnosticHomepageCalls
// ====================================================

export interface diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_patientObj {
  __typename: "PatientObj";
  firstName: string | null;
  lastName: string | null;
}

export interface diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_attributesObj {
  __typename: "AttributesObj";
  reportTATMessage: string | null;
  reportGenerationTime: string | null;
  expectedReportGenerationTime: any | null;
}

export interface diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  testPreparationData: string | null;
  preTestingRequirement: string | null;
}

export interface diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  itemObj: diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems_itemObj | null;
}

export interface diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders {
  __typename: "DiagnosticOrders";
  id: string;
  displayId: number;
  patientId: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  slotDateTimeInUTC: any | null;
  labReportURL: string | null;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  patientObj: diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_patientObj | null;
  attributesObj: diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_attributesObj | null;
  diagnosticOrderLineItems: (diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems | null)[] | null;
}

export interface diagnosticHomepageCalls_getDiagnosticOpenOrdersList {
  __typename: "DiagnosticOpenOrdersResult";
  openOrders: (diagnosticHomepageCalls_getDiagnosticOpenOrdersList_openOrders | null)[] | null;
}

export interface diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_patientObj {
  __typename: "PatientObj";
  firstName: string | null;
  lastName: string | null;
}

export interface diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  testPreparationData: string | null;
  preTestingRequirement: string | null;
}

export interface diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  itemObj: diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems_itemObj | null;
}

export interface diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_attributesObj {
  __typename: "AttributesObj";
  reportTATMessage: string | null;
  reportGenerationTime: string | null;
  expectedReportGenerationTime: any | null;
}

export interface diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders {
  __typename: "DiagnosticOrders";
  id: string;
  displayId: number;
  patientId: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  slotDateTimeInUTC: any | null;
  labReportURL: string | null;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  patientObj: diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_patientObj | null;
  diagnosticOrderLineItems: (diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems | null)[] | null;
  attributesObj: diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders_attributesObj | null;
}

export interface diagnosticHomepageCalls_getDiagnosticClosedOrdersList {
  __typename: "DiagnosticClosedOrdersResult";
  closedOrders: (diagnosticHomepageCalls_getDiagnosticClosedOrdersList_closedOrders | null)[] | null;
}

export interface diagnosticHomepageCalls {
  getDiagnosticOpenOrdersList: diagnosticHomepageCalls_getDiagnosticOpenOrdersList;
  getDiagnosticClosedOrdersList: diagnosticHomepageCalls_getDiagnosticClosedOrdersList;
}

export interface diagnosticHomepageCallsVariables {
  mobile_number: string;
  skip: number;
  take: number;
}
