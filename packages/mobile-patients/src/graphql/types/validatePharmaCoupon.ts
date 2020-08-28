/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PharmaCouponInput, CouponCategoryApplicable } from "./globalTypes";

// ====================================================
// GraphQL query operation: validatePharmaCoupon
// ====================================================

export interface validatePharmaCoupon_validatePharmaCoupon_discountedTotals {
  __typename: "DiscountedTotals";
  couponDiscount: number;
  mrpPriceTotal: number;
  productDiscount: number;
}

export interface validatePharmaCoupon_validatePharmaCoupon_pharmaLineItemsWithDiscountedPrice {
  __typename: "PharmaLineItems";
  applicablePrice: number;
  discountedPrice: number;
  itemId: string;
  mrp: number;
  productName: string;
  productType: CouponCategoryApplicable;
  quantity: number;
  specialPrice: number;
}

export interface validatePharmaCoupon_validatePharmaCoupon {
  __typename: "PharmaOutput";
  discountedTotals: validatePharmaCoupon_validatePharmaCoupon_discountedTotals | null;
  pharmaLineItemsWithDiscountedPrice: (validatePharmaCoupon_validatePharmaCoupon_pharmaLineItemsWithDiscountedPrice | null)[] | null;
  successMessage: string | null;
  reasonForInvalidStatus: string;
  validityStatus: boolean;
}

export interface validatePharmaCoupon {
  validatePharmaCoupon: validatePharmaCoupon_validatePharmaCoupon | null;
}

export interface validatePharmaCouponVariables {
  pharmaCouponInput?: PharmaCouponInput | null;
}
