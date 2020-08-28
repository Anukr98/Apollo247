/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DiscountType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getCoupons
// ====================================================

export interface getCoupons_getCoupons_coupons {
  __typename: "Coupon";
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discount: number;
  minimumOrderAmount: number | null;
  expirationDate: any | null;
  isActive: boolean | null;
}

export interface getCoupons_getCoupons {
  __typename: "CouponsResult";
  coupons: (getCoupons_getCoupons_coupons | null)[] | null;
}

export interface getCoupons {
  getCoupons: getCoupons_getCoupons | null;
}
