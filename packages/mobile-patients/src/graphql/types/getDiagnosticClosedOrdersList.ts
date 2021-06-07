/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticClosedOrdersList
// ====================================================

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_patientObj {
  __typename: "PatientObj";
  firstName: string | null;
  lastName: string | null;
}

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  inclusions: (number | null)[] | null;
  testPreparationData: string | null;
}

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  itemObj: getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems_itemObj | null;
}

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_attributesObj {
  __typename: "AttributesObj";
  reportGenerationTime: string | null;
  preTestingRequirement: string | null;
}

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders {
  __typename: "DiagnosticOrders";
  id: string;
  displayId: number;
  patientId: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  slotDateTimeInUTC: any | null;
  labReportURL: string | null;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  paymentOrderId: string | null;
  patientObj: getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_patientObj | null;
  diagnosticOrderLineItems: (getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_diagnosticOrderLineItems | null)[] | null;
  attributesObj: getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders_attributesObj | null;
}

export interface getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList {
  __typename: "DiagnosticClosedOrdersResult";
  closedOrders: (getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList_closedOrders | null)[] | null;
}

export interface getDiagnosticClosedOrdersList {
  getDiagnosticClosedOrdersList: getDiagnosticClosedOrdersList_getDiagnosticClosedOrdersList;
}

export interface getDiagnosticClosedOrdersListVariables {
  mobileNumber: string;
  skip: number;
  take: number;
}
