/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOpenOrdersList
// ====================================================

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_patientObj {
  __typename: "PatientObj";
  firstName: string | null;
  lastName: string | null;
}

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  inclusions: (number | null)[] | null;
  testPreparationData: string | null;
}

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  itemObj: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems_itemObj | null;
}

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_attributesObj {
  __typename: "AttributesObj";
  reportGenerationTime: string | null;
  preTestingRequirement: string | null;
}

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders {
  __typename: "DiagnosticOrders";
  id: string;
  displayId: number;
  patientId: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  slotDateTimeInUTC: any | null;
  labReportURL: string | null;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  patientObj: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_patientObj | null;
  diagnosticOrderLineItems: (getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_diagnosticOrderLineItems | null)[] | null;
  attributesObj: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders_attributesObj | null;
}

export interface getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList {
  __typename: "DiagnosticOpenOrdersResult";
  openOrders: (getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders | null)[] | null;
}

export interface getDiagnosticOpenOrdersList {
  getDiagnosticOpenOrdersList: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList;
}

export interface getDiagnosticOpenOrdersListVariables {
  mobileNumber: string;
  skip: number;
  take: number;
}
