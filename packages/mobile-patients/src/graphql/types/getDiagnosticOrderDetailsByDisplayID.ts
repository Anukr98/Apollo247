/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrderDetailsByDisplayID
// ====================================================

export interface getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID_ordersList_attributesObj {
  __typename: "AttributesObj";
  homeCollectionCharges: number | null;
  slotDurationInMinutes: number | null;
  initialCollectionCharges: number | null;
  distanceCharges: number | null;
  expectedReportGenerationTime: any | null;
  reportTATMessage: string | null;
}

export interface getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID_ordersList_diagnosticOrdersStatus {
  __typename: "DiagnosticOrdersStatus";
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
}

export interface getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID_ordersList {
  __typename: "DiagnosticOrders";
  patientId: string;
  patientAddressId: string;
  parentOrderId: string | null;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  totalPrice: number;
  createdDate: any;
  slotDateTimeInUTC: any | null;
  visitNo: string | null;
  isRescheduled: boolean | null;
  preBookingId: string | null;
  id: string;
  attributesObj: getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID_ordersList_attributesObj | null;
  diagnosticOrdersStatus: (getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID_ordersList_diagnosticOrdersStatus | null)[] | null;
}

export interface getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID {
  __typename: "DiagnosticOrderResult";
  ordersList: getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID_ordersList | null;
}

export interface getDiagnosticOrderDetailsByDisplayID {
  getDiagnosticOrderDetailsByDisplayID: getDiagnosticOrderDetailsByDisplayID_getDiagnosticOrderDetailsByDisplayID;
}

export interface getDiagnosticOrderDetailsByDisplayIDVariables {
  displayId: number;
}
