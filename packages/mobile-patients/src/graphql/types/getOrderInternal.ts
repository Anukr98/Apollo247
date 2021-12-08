/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { REFUND_STATUSES } from "./globalTypes";

// ====================================================
// GraphQL query operation: getOrderInternal
// ====================================================

export interface getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList_attributesObj {
  __typename: "AttributesObj";
  slotDurationInMinutes: number | null;
}

export interface getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList_patientObj {
  __typename: "PatientObj";
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export interface getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  itemId: number | null;
  itemName: string | null;
  price: number | null;
  editOrderID: string | null;
}

export interface getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList {
  __typename: "DiagnosticOrders";
  id: string;
  patientId: string;
  primaryOrderID: string | null;
  displayId: number;
  slotDateTimeInUTC: any | null;
  attributesObj: getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList_attributesObj | null;
  patientObj: getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList_patientObj | null;
  diagnosticOrderLineItems: (getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList_diagnosticOrderLineItems | null)[] | null;
}

export interface getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails {
  __typename: "DiagnosticOrdersResult";
  ordersList: (getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails_ordersList | null)[] | null;
}

export interface getOrderInternal_getOrderInternal_refunds {
  __typename: "Refund";
  status: REFUND_STATUSES | null;
  unique_request_id: string | null;
  sent_to_gateway: boolean | null;
  initiated_by: string | null;
  created_at: any | null;
  updated_at: any | null;
  amount: number | null;
}

export interface getOrderInternal_getOrderInternal {
  __typename: "PaymentOrder";
  id: string;
  txn_uuid: string | null;
  txn_id: string | null;
  status_id: number | null;
  payment_order_id: string;
  DiagnosticsPaymentDetails: getOrderInternal_getOrderInternal_DiagnosticsPaymentDetails | null;
  refunds: (getOrderInternal_getOrderInternal_refunds | null)[] | null;
}

export interface getOrderInternal {
  getOrderInternal: getOrderInternal_getOrderInternal;
}

export interface getOrderInternalVariables {
  order_id: string;
}
