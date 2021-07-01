/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE, DIAGNOSTICS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrdersList
// ====================================================

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_phleboDetailsObj {
  __typename: "PhleboDetailsObj";
  PhelboOTP: string | null;
  PhelbotomistName: string;
  PhelbotomistMobile: string;
  PhelbotomistTrackLink: string;
  TempRecording: string | null;
  CheckInTime: any | null;
  PhleboLatitude: number | null;
  PhleboLongitude: number | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderReschedule {
  __typename: "DiagnosticOrderReschedule";
  rescheduleDate: any | null;
  rescheduleReason: string | null;
  comments: string | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderCancellation {
  __typename: "DiagnosticOrderCancellation";
  cancellationReason: string | null;
  cancelType: string | null;
  cancelByName: string | null;
  comments: string | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrdersStatus {
  __typename: "DiagnosticOrdersStatus";
  id: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
  itemId: number | null;
  itemName: string | null;
  packageId: number | null;
  packageName: string | null;
  hideStatus: boolean | null;
  statusMessage: string | null;
  statusDate: any | null;
}

export interface getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  itemType: string | null;
  testPreparationData: string | null;
  packageCalculatedMrp: number | null;
  inclusions: (number | null)[] | null;
  reportGenerationTime: string | null;
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
  itemId: number;
  itemName: string;
  itemType: DIAGNOSTICS_TYPE | null;
  testDescription: string | null;
  testPreparationData: string;
  inclusions: (number | null)[] | null;
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
  city: string | null;
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
  visitNo: string | null;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  paymentOrderId: string | null;
  phleboDetailsObj: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_phleboDetailsObj | null;
  diagnosticOrderReschedule: (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderReschedule | null)[] | null;
  diagnosticOrderCancellation: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderCancellation | null;
  diagnosticOrdersStatus: (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrdersStatus | null)[] | null;
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
