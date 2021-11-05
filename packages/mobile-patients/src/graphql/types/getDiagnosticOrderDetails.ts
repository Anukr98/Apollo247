/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE, DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrderDetails
// ====================================================

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_patientObj {
  __typename: "PatientObj";
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_patientAddressObj {
  __typename: "PatientAddressObj";
  addressLine1: string | null;
  addressLine2: string | null;
  addressType: string | null;
  landmark: string | null;
  state: string | null;
  city: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_attributesObj {
  __typename: "AttributesObj";
  slotDurationInMinutes: number | null;
  expectedReportGenerationTime: any | null;
  reportTATMessage: string | null;
  initialCollectionCharges: number | null;
  distanceCharges: number | null;
  homeCollectionCharges: number | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  itemType: string | null;
  testPreparationData: string | null;
  packageCalculatedMrp: number | null;
  inclusions: (number | null)[] | null;
  reportGenerationTime: string | null;
}

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
  itemName: string;
  itemId: number;
  gender: string;
  rate: number;
  itemRemarks: string;
  city: string;
  state: string;
  itemType: DIAGNOSTICS_TYPE | null;
  fromAgeInDays: number;
  collectionType: TEST_COLLECTION_TYPE | null;
  testDescription: string | null;
  testPreparationData: string;
  inclusions: (number | null)[] | null;
  diagnosticPricing: (getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  id: string;
  itemId: number | null;
  itemName: string | null;
  itemType: DIAGNOSTICS_TYPE | null;
  price: number | null;
  quantity: number | null;
  groupPlan: string | null;
  editOrderID: string | null;
  isRemoved: boolean | null;
  itemObj: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems_itemObj | null;
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
  patientId: string;
  patientAddressId: string;
  patientObj: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_patientObj | null;
  patientAddressObj: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_patientAddressObj | null;
  slotTimings: string;
  slotId: string | null;
  totalPrice: number;
  attributesObj: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_attributesObj | null;
  prescriptionUrl: string;
  diagnosticDate: any;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  orderType: string;
  displayId: number;
  createdDate: any;
  collectionCharges: number | null;
  slotDateTimeInUTC: any | null;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  visitNo: string | null;
  invoiceURL: string | null;
  labReportURL: string | null;
  couponDiscAmount: number | null;
  paymentOrderId: string | null;
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
