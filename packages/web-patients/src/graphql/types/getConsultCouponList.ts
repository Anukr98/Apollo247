/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getConsultCouponList
// ====================================================

export interface getConsultCouponList_getConsultCouponList_coupons_couponConsultRule {
  __typename: "CouponConsultRule";
  isActive: boolean | null;
}

export interface getConsultCouponList_getConsultCouponList_coupons {
  __typename: "ConsultCoupon";
  code: string | null;
  displayStatus: boolean | null;
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
