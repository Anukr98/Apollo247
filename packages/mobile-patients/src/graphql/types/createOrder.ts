/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderInputV2, PAYMENT_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: createOrder
// ====================================================

export interface createOrder_createOrderV2_mobile_token {
  __typename: "MobileToken";
  client_auth_token_expiry: any | null;
  client_auth_token: string | null;
}

export interface createOrder_createOrderV2 {
  __typename: "PaymentStatusResponse";
  payment_status: PAYMENT_STATUS | null;
  payment_order_id: string | null;
  mobile_token: createOrder_createOrderV2_mobile_token | null;
}

export interface createOrder {
  createOrderV2: createOrder_createOrderV2 | null;
}

export interface createOrderVariables {
  order_input?: OrderInputV2 | null;
}
