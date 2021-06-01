/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: createOrder
// ====================================================

export interface createOrder_createOrder_OrderSuccessResponseZeroAmount {
  __typename: "OrderSuccessResponseZeroAmount";
}

export interface createOrder_createOrder_OrderSuccessResponsePrepaid_payment_links {
  __typename: "PaymentLinks";
  mobile: string | null;
  web: string | null;
}

export interface createOrder_createOrder_OrderSuccessResponsePrepaid_juspay {
  __typename: "MobileToken";
  client_auth_token_expiry: any | null;
  client_auth_token: string | null;
}

export interface createOrder_createOrder_OrderSuccessResponsePrepaid {
  __typename: "OrderSuccessResponsePrepaid";
  status_id: number | null;
  status: string | null;
  id: string | null;
  payment_links: createOrder_createOrder_OrderSuccessResponsePrepaid_payment_links | null;
  order_id: string | null;
  juspay: createOrder_createOrder_OrderSuccessResponsePrepaid_juspay | null;
}

export interface createOrder_createOrder_OrderSuccessResponseCOD {
  __typename: "OrderSuccessResponseCOD";
  order_id: string | null;
  success: boolean | null;
}

export type createOrder_createOrder = createOrder_createOrder_OrderSuccessResponseZeroAmount | createOrder_createOrder_OrderSuccessResponsePrepaid | createOrder_createOrder_OrderSuccessResponseCOD;

export interface createOrder {
  createOrder: createOrder_createOrder | null;
}

export interface createOrderVariables {
  order_input?: OrderInput | null;
}
