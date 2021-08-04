/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderInputV2, PAYMENT_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateOrderDetails
// ====================================================

export interface updateOrderDetails_updateOrderDetails_mobile_token {
  __typename: "MobileToken";
  client_auth_token_expiry: any | null;
  client_auth_token: string | null;
}

export interface updateOrderDetails_updateOrderDetails {
  __typename: "PaymentStatusResponse";
  payment_status: PAYMENT_STATUS | null;
  payment_order_id: string | null;
  mobile_token: updateOrderDetails_updateOrderDetails_mobile_token | null;
}

export interface updateOrderDetails {
  updateOrderDetails: updateOrderDetails_updateOrderDetails | null;
}

export interface updateOrderDetailsVariables {
  order_input?: OrderInputV2 | null;
}
