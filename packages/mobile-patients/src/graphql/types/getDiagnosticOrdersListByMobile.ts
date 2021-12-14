/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTIC_ORDER_STATUS, DIAGNOSTIC_ORDER_PAYMENT_TYPE, DIAGNOSTICS_TYPE } from "./globalTypes";

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

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_attributesObj {
  __typename: "AttributesObj";
  preTestingRequirement: string | null;
  reportGenerationTime: string | null;
  initialCollectionCharges: number | null;
  isMultiUhid: boolean | null;
  slotDurationInMinutes: number | null;
  homeCollectionCharges: number | null;
  distanceCharges: number | null;
  expectedReportGenerationTime: any | null;
  reportTATMessage: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientAddressObj {
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
  reportGenerationTime: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_pricingObj {
  __typename: "PricingObj";
  mrp: number | null;
  price: number | null;
  groupPlan: string | null;
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
  editOrderID: string | null;
  isRemoved: boolean | null;
  itemObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_itemObj | null;
  pricingObj: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_pricingObj | null)[] | null;
  diagnostics: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems_diagnostics | null;
  testPreparationData: string | null;
  packageCalculatedMrp: number | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_phleboDetailsObj {
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

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderPhlebotomists_diagnosticPhlebotomists {
  __typename: "DiagnosticPhlebotomists";
  id: string;
  name: string;
  mobile: string | null;
  vaccinationStatus: string | null;
}

export interface getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderPhlebotomists {
  __typename: "DiagnosticOrderPhlebotomists";
  phleboRating: number | null;
  phleboOTP: string | null;
  checkinDateTime: any | null;
  phleboTrackLink: string | null;
  diagnosticPhlebotomists: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderPhlebotomists_diagnosticPhlebotomists;
  isPhleboETAElapsed: boolean | null;
  phleboETAElapsedMessage: string | null;
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
  parentOrderId: string | null;
  primaryOrderID: string | null;
  isRescheduled: boolean | null;
  rescheduleCount: number | null;
  areaId: number | null;
  cityId: number | null;
  patientId: string;
  orderType: string;
  totalPrice: number;
  orderStatus: DIAGNOSTIC_ORDER_STATUS;
  createdDate: any;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  diagnosticDate: any;
  paymentOrderId: string | null;
  patientAddressId: string;
  displayId: number;
  visitNo: string | null;
  labReportURL: string | null;
  passportNo: string | null;
  slotTimings: string;
  slotId: string | null;
  slotDateTimeInUTC: any | null;
  collectionCharges: number | null;
  patientObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientObj | null;
  attributesObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_attributesObj | null;
  patientAddressObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientAddressObj | null;
  diagnosticOrdersStatus: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus | null)[] | null;
  diagnosticOrderLineItems: (getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems | null)[] | null;
  phleboDetailsObj: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_phleboDetailsObj | null;
  diagnosticOrderPhlebotomists: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderPhlebotomists | null;
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
