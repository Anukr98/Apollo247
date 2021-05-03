/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTICS_TYPE, DIAGNOSTIC_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDiagnosticOrdersListByMobile
// ====================================================

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientObj {
  __typename: "PatientObj";
  id: string | null;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientAddressObj {
  __typename: "PatientAddressObj";
  addressLine1: string | null;
  addressLine2: string | null;
  landmark: string | null;
  state: string | null;
  city: string | null;
  zipcode: number | null;
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

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  itemType: string | null;
  testPreparationData: string | null;
  packageCalculatedMrp: number | null;
  inclusions: (number | null)[] | null;
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
  id: string;
  itemId: number;
  itemName: string;
  itemType: DIAGNOSTICS_TYPE | null;
  toAgeInDays: number;
  canonicalTag: string | null;
  fromAgeInDays: number;
  testDescription: string | null;
  inclusions: (number | null)[] | null;
  testPreparationData: string;
  diagnosticPricing: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_diagnostics_diagnosticPricing | null)[] | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  id: string;
  itemId: number | null;
  quantity: number | null;
  itemName: string | null;
  groupPlan: string | null;
  price: number | null;
  itemType: DIAGNOSTICS_TYPE | null;
  itemObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_itemObj | null;
  diagnostics: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_diagnostics | null;
  testPreparationData: string | null;
  packageCalculatedMrp: number | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_phleboDetailsObj {
  __typename: "PhleboDetailsObj";
  PhelboOTP: string | null;
  PhelbotomistName: string | null;
  PhelbotomistMobile: string | null;
  PhelbotomistTrackLink: string | null;
  TempRecording: string | null;
  CheckInTime: string | null;
  PhleboLatitude: string | null;
  PhleboLongitude: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderReschedule {
  __typename: "DiagnosticOrderReschedule";
  rescheduleDate: any | null;
  rescheduleReason: string | null;
  comments: string | null;
  rescheduleDateTimeInUTC: any | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderCancellation {
  __typename: "DiagnosticOrderCancellation";
  cancellationReason: string | null;
  cancelType: string | null;
  cancelByName: string | null;
  comments: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList {
  __typename: "DiagnosticOrders";
  id: string;
  isRescheduled: boolean | null;
  rescheduleCount: number | null;
  areaId: number | null;
  addressLine1: string | null;
  addressLine2: string | null;
  patientId: string;
  displayId: number;
  diagnosticDate: any;
  diagnosticBranchCode: string;
  diagnosticEmployeeCode: string;
  visitNo: string | null;
  labReportURL: string | null;
  patientObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientObj | null;
  patientAddressObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientAddressObj | null;
  diagnosticOrdersStatus: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus | null)[] | null;
  diagnosticOrderLineItems: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems | null)[] | null;
  orderType: string;
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
  slotTimings: string;
  slotDateTimeInUTC: any | null;
  collectionCharges: number | null;
  diagnosticOrderReschedule: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderReschedule | null)[] | null;
  diagnosticOrderCancellation: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderCancellation | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_membersDetails {
  __typename: "membersDetails";
  id: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile {
  __typename: "DiagnosticOrdersResultMemberDetails";
  ordersList: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList | null)[] | null;
  ordersCount: number | null;
  membersDetails: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_membersDetails | null)[] | null;
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
