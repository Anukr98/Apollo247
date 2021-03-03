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
  bank: string | null;
  method: string | null;
  image_url: string | null;
}

export interface getPaymentMethods_getPaymentMethods {
  __typename: "PaymentMode";
  name: PAYMENT_METHODS_JUSPAY;
  featured_banks: (getPaymentMethods_getPaymentMethods_featured_banks | null)[] | null;
}

export interface getPaymentMethods {
  getPaymentMethods: (getPaymentMethods_getPaymentMethods | null)[] | null;
}
