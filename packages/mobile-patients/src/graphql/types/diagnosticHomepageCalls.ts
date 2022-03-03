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

export interface diagnosticHomepageCalls_getPatientLatestPrescriptions_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescriptionDiag";
  itemId: number | null;
  itemname: string;
  gender: string | null;
  testInstruction: string | null;
}

export interface diagnosticHomepageCalls_getPatientLatestPrescriptions_caseSheet {
  __typename: "CaseSheetDiag";
  id: string;
  blobName: string | null;
  diagnosticPrescription: (diagnosticHomepageCalls_getPatientLatestPrescriptions_caseSheet_diagnosticPrescription | null)[] | null;
}

export interface diagnosticHomepageCalls_getPatientLatestPrescriptions {
  __typename: "PatientPrescriptionsResponse";
  doctorName: string | null;
  doctorCredentials: string | null;
  patientName: string | null;
  prescriptionDateTime: any | null;
  numberOfTests: number | null;
  orderCount: number | null;
  caseSheet: diagnosticHomepageCalls_getPatientLatestPrescriptions_caseSheet | null;
}

export interface diagnosticHomepageCalls_GetSubscriptionsOfUserByStatus {
  __typename: "GetGenericJSONResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: any | null;
}

export interface diagnosticHomepageCalls {
  getDiagnosticOpenOrdersList: diagnosticHomepageCalls_getDiagnosticOpenOrdersList;
  getDiagnosticClosedOrdersList: diagnosticHomepageCalls_getDiagnosticClosedOrdersList;
  getPatientLatestPrescriptions: (diagnosticHomepageCalls_getPatientLatestPrescriptions | null)[] | null;
  GetSubscriptionsOfUserByStatus: diagnosticHomepageCalls_GetSubscriptionsOfUserByStatus;
}

export interface diagnosticHomepageCallsVariables {
  mobile_number: string;
  skip: number;
  take: number;
  prescriptionLimit: number;
  cityId: number;
  status: string[];
}
