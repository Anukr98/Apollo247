/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderCreate } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: createOrderInternal
// ====================================================

export interface createOrderInternal_createOrderInternal {
  __typename: "PaymentOrderCreatedResponse";
  payment_order_id: string | null;
  success: boolean | null;
}

export interface createOrderInternal {
  createOrderInternal: createOrderInternal_createOrderInternal | null;
}

export interface createOrderInternalVariables {
  order?: OrderCreate | null;
}
