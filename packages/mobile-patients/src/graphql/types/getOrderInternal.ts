/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { REFUND_STATUSES } from "./globalTypes";

// ====================================================
// GraphQL query operation: getOrderInternal
// ====================================================

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
  refunds: (getOrderInternal_getOrderInternal_refunds | null)[] | null;
}

export interface getOrderInternal {
  getOrderInternal: getOrderInternal_getOrderInternal;
}

export interface getOrderInternalVariables {
  order_id: string;
}
