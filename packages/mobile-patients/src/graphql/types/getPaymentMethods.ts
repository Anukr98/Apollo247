/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PAYMENT_METHODS_JUSPAY } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPaymentMethods
// ====================================================

export interface getPaymentMethods_getPaymentMethods_featured_banks {
  __typename: "PaymentMethod";
  bank: string;
  method: string;
  image_url: string | null;
  payment_method_name: string | null;
  payment_method_code: string | null;
  minimum_supported_version: string | null;
}

export interface getPaymentMethods_getPaymentMethods {
  __typename: "PaymentMode";
  name: PAYMENT_METHODS_JUSPAY;
  minimum_supported_version: string | null;
  payment_methods: (getPaymentMethods_getPaymentMethods_payment_methods | null)[] | null;
}

export interface getPaymentMethods {
  getPaymentMethods: (getPaymentMethods_getPaymentMethods | null)[];
}

export interface getPaymentMethodsVariables {
  is_mobile?: boolean | null;
}

export interface getPaymentMethodsVariables {
  is_mobile?: boolean | null;
}
