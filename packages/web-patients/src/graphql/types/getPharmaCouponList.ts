/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CouponCategoryApplicable, PharmaDiscountApplicableOn } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPharmaCouponList
// ====================================================

export interface getPharmaCouponList_getPharmaCouponList_coupons_couponPharmaRule {
  __typename: "CouponPharmaRule";
  couponCategoryApplicable: CouponCategoryApplicable | null;
  discountApplicableOn: PharmaDiscountApplicableOn | null;
  messageOnCouponScreen: string | null;
  successMessage: string | null;
}

export interface getPharmaCouponList_getPharmaCouponList_coupons {
  __typename: "ConsultCoupon";
  code: string | null;
  couponPharmaRule: getPharmaCouponList_getPharmaCouponList_coupons_couponPharmaRule | null;
  createdDate: any | null;
  description: string | null;
  id: string | null;
  isActive: boolean | null;
}

export interface getPharmaCouponList_getPharmaCouponList {
  __typename: "CouponList";
  coupons: (getPharmaCouponList_getPharmaCouponList_coupons | null)[] | null;
}

export interface getPharmaCouponList {
  getPharmaCouponList: getPharmaCouponList_getPharmaCouponList | null;
}
