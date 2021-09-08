/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PAYMENT_METHODS_JUSPAY_V2 } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPaymentMethodsV2
// ====================================================

export interface getPaymentMethodsV2_getPaymentMethodsV2_payment_methods {
  __typename: "PaymentMethods";
  image_url: string | null;
  payment_method_name: string | null;
  payment_method_code: string | null;
  minimum_supported_version: string | null;
  outage_status: string | null;
}

export interface getPaymentMethodsV2_getPaymentMethodsV2 {
  __typename: "PaymentMethodsV2";
  name: PAYMENT_METHODS_JUSPAY_V2;
  minimum_supported_version: string | null;
  payment_methods: (getPaymentMethodsV2_getPaymentMethodsV2_payment_methods | null)[] | null;
}

export interface getPaymentMethodsV2 {
  getPaymentMethodsV2: (getPaymentMethodsV2_getPaymentMethodsV2 | null)[] | null;
}

export interface getPaymentMethodsV2Variables {
  is_mobile?: boolean | null;
  payment_order_id: string;
}
