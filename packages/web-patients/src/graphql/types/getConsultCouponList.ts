/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CouponCategoryApplicable, PharmaDiscountApplicableOn, AppointmentType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getConsultCouponList
// ====================================================

export interface getConsultCouponList_getConsultCouponList_coupons_couponPharmaRule {
  __typename: "CouponPharmaRule";
  couponCategoryApplicable: CouponCategoryApplicable | null;
  discountApplicableOn: PharmaDiscountApplicableOn | null;
  messageOnCouponScreen: string | null;
  successMessage: string | null;
}

export interface getConsultCouponList_getConsultCouponList_coupons_couponConsultRule {
  __typename: "CouponConsultRule";
  couponApplicability: AppointmentType | null;
  createdDate: any | null;
  id: string | null;
  isActive: boolean | null;
}

export interface getConsultCouponList_getConsultCouponList_coupons {
  __typename: "ConsultCoupon";
  code: string | null;
  couponPharmaRule: getConsultCouponList_getConsultCouponList_coupons_couponPharmaRule | null;
  couponConsultRule: getConsultCouponList_getConsultCouponList_coupons_couponConsultRule | null;
  createdDate: any | null;
  description: string | null;
  id: string | null;
  isActive: boolean | null;
}

export interface getConsultCouponList_getConsultCouponList {
  __typename: "CouponList";
  coupons: (getConsultCouponList_getConsultCouponList_coupons | null)[] | null;
}

export interface getConsultCouponList {
  getConsultCouponList: getConsultCouponList_getConsultCouponList | null;
}
