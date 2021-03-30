/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PAYMENT_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAppointmentInfo
// ====================================================

export interface getAppointmentInfo_getOrderInternal_internal_orders_AppointmentDetails_amountBreakup {
  __typename: "AmountBreakUp";
  actual_price: number | null;
  slashed_price: number | null;
}

export interface getAppointmentInfo_getOrderInternal_internal_orders_AppointmentDetails {
  __typename: "Appointment";
  displayId: string;
  amountBreakup: getAppointmentInfo_getOrderInternal_internal_orders_AppointmentDetails_amountBreakup | null;
}

export interface getAppointmentInfo_getOrderInternal_internal_orders {
  __typename: "InternalOrder";
  AppointmentDetails: getAppointmentInfo_getOrderInternal_internal_orders_AppointmentDetails | null;
}

export interface getAppointmentInfo_getOrderInternal {
  __typename: "PaymentOrder";
  payment_order_id: string;
  payment_status: PAYMENT_STATUS | null;
  internal_orders: (getAppointmentInfo_getOrderInternal_internal_orders | null)[] | null;
}

export interface getAppointmentInfo {
  getOrderInternal: getAppointmentInfo_getOrderInternal;
}

export interface getAppointmentInfoVariables {
  order_id: string;
}
