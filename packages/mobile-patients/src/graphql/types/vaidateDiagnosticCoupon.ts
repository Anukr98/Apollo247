/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CouponInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: vaidateDiagnosticCoupon
// ====================================================

export interface vaidateDiagnosticCoupon_vaidateDiagnosticCoupon_data_tests {
  __typename: "DataResponseBody";
  itemid: string;
  itemName: string;
  discamount: number;
  rate: number;
}

export interface vaidateDiagnosticCoupon_vaidateDiagnosticCoupon_data {
  __typename: "Tests";
  tests: (vaidateDiagnosticCoupon_vaidateDiagnosticCoupon_data_tests | null)[] | null;
}

export interface vaidateDiagnosticCoupon_vaidateDiagnosticCoupon {
  __typename: "ValidateCopounDataResponse";
  status: boolean;
  message: string;
  uniqueid: string | null;
  data: vaidateDiagnosticCoupon_vaidateDiagnosticCoupon_data | null;
}

export interface vaidateDiagnosticCoupon {
  vaidateDiagnosticCoupon: vaidateDiagnosticCoupon_vaidateDiagnosticCoupon | null;
}

export interface vaidateDiagnosticCouponVariables {
  couponInput?: CouponInput | null;
}
