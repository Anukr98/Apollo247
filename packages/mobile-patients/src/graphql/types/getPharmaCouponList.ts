/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AppointmentType, CouponCategoryApplicable, PharmaDiscountApplicableOn, CustomerType, DiscountType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPharmaCouponList
// ====================================================

export interface getPharmaCouponList_getPharmaCouponList_coupons_couponConsultRule {
  __typename: "CouponConsultRule";
  couponApplicability: AppointmentType | null;
  id: string | null;
}

export interface getPharmaCouponList_getPharmaCouponList_coupons_couponPharmaRule {
  __typename: "CouponPharmaRule";
  couponCategoryApplicable: CouponCategoryApplicable | null;
  discountApplicableOn: PharmaDiscountApplicableOn | null;
  messageOnCouponScreen: string | null;
  successMessage: string | null;
}

export interface getPharmaCouponList_getPharmaCouponList_coupons_couponGenericRule {
  __typename: "CouponGenericRule";
  id: string | null;
  minimumCartValue: number | null;
  maximumCartValue: number | null;
  couponDueDate: any | null;
  couponEndDate: any | null;
  couponStartDate: any | null;
  couponReuseCount: number | null;
  couponReuseCountPerCustomer: number | null;
  couponApplicableCustomerType: CustomerType | null;
  discountType: DiscountType | null;
  discountValue: number | null;
}

export interface getPharmaCouponList_getPharmaCouponList_coupons {
  __typename: "ConsultCoupon";
  code: string | null;
  couponConsultRule: getPharmaCouponList_getPharmaCouponList_coupons_couponConsultRule | null;
  couponPharmaRule: getPharmaCouponList_getPharmaCouponList_coupons_couponPharmaRule | null;
  couponGenericRule: getPharmaCouponList_getPharmaCouponList_coupons_couponGenericRule | null;
  createdDate: any | null;
  description: string | null;
  id: string | null;
  isActive: boolean | null;
  displayStatus: boolean | null;
}

export interface getPharmaCouponList_getPharmaCouponList {
  __typename: "CouponList";
  coupons: (getPharmaCouponList_getPharmaCouponList_coupons | null)[] | null;
}

export interface getPharmaCouponList {
  getPharmaCouponList: getPharmaCouponList_getPharmaCouponList | null;
}
