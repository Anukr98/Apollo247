/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DEVICETYPE, DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrdersListByMobile
// ====================================================

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_attachmentData {
  __typename: "AttachmentsData";
  fileName: string | null;
  documentName: string | null;
  documentBase64String: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus {
  __typename: "DiagnosticOrdersStatus";
  id: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS | null;
  statusDate: any | null;
  itemId: number | null;
  packageId: number | null;
  itemName: string | null;
  packageName: string | null;
  hideStatus: boolean | null;
  statusMessage: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  status: string | null;
  endDate: any | null;
  groupPlan: string;
  startDate: any | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_diagnostics {
  __typename: "Diagnostics";
  rate: number;
  state: string;
  itemName: string;
  itemRemarks: string;
  toAgeInDays: number;
  canonicalTag: string | null;
  fromAgeInDays: number;
  diagnosticPricing: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing | null)[] | null;
  packageCalculatedMrp: number | null;
  testPreparationData: string;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  quantity: number | null;
  itemName: string | null;
  groupPlan: string | null;
  diagnostics: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_diagnostics | null;
  testPreparationData: string | null;
  packageCalculatedMrp: number | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_phleboDetailsObj {
  __typename: "PhleboDetailsObj";
  PhelboOTP: number | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderReschedule {
  __typename: "DiagnosticOrderReschedule";
  patientId: string | null;
  createdDate: any | null;
  updatedDate: any | null;
  rescheduleDate: any | null;
  rescheduleReason: string | null;
  diagnosticOrdersId: string | null;
  rescheduleDateTimeInUTC: any | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderCancellation {
  __typename: "DiagnosticOrderCancellation";
  patientId: string | null;
  cancelType: string | null;
  createdDate: any | null;
  updatedDate: any | null;
  cancelByName: string | null;
  diagnosticOrdersId: string | null;
  cancellationReason: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList {
  __typename: "DiagnosticOrders";
  id: string;
  isRescheduled: boolean | null;
  rescheduleCount: number | null;
  areaId: number | null;
  attachmentData: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_attachmentData | null)[] | null;
  addressType: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  patientId: string;
  displayId: number;
  deviceType: DEVICETYPE | null;
  diagnosticDate: any;
  diagnosticBranchCode: string;
  diagnosticEmployeeCode: string;
  diagnosticOrdersStatus: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus | null)[] | null;
  diagnosticOrderLineItems: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems | null)[] | null;
  totalPrice: number;
  centerName: string;
  centerState: string;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  createdDate: any;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  centerLocality: string;
  paymentOrderId: string | null;
  patientAddressId: string;
  phleboDetailsObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_phleboDetailsObj | null;
  slotDateTimeInUTC: any | null;
  collectionCharges: number | null;
  diagnosticOrderReschedule: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderReschedule | null)[] | null;
  diagnosticOrderCancellation: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderCancellation | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile {
  __typename: "DiagnosticOrdersResultMemberDetails";
  ordersList: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList | null)[] | null;
  ordersCount: number | null;
}

export interface getDiagnosticOrdersListByMobile {
  getDiagnosticOrdersListByMobile: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile;
}

export interface getDiagnosticOrdersListByMobileVariables {
  mobileNumber?: string | null;
  paginated?: boolean | null;
  limit?: number | null;
  offset?: number | null;
}
