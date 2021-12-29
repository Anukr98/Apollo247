/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PrescriptionType, PLAN_ID, PLAN, CouponApplicable } from "./globalTypes";

// ====================================================
// GraphQL query operation: fetchCart
// ====================================================

export interface fetchCart_fetchCart_data_amount_circleSavings {
  __typename: "CartCircleSavingsResponse";
  membershipCashBack: number | null;
  circleDelivery: number | null;
}

export interface fetchCart_fetchCart_data_amount {
  __typename: "CartAmount";
  estimatedAmount: number | null;
  deliveryCharges: number | null;
  isDeliveryFree: boolean | null;
  cartSavings: number | null;
  couponSavings: number | null;
  totalCashBack: number | null;
  cartTotal: number | null;
  packagingCharges: number | null;
  circleSavings: fetchCart_fetchCart_data_amount_circleSavings | null;
}

export interface fetchCart_fetchCart_data_couponDetails {
  __typename: "CartCouponResponse";
  coupon: string | null;
  couponMessage: string | null;
  valid: boolean | null;
  textOffer: string | null;
  reason: string | null;
  circleBenefits: boolean | null;
}

export interface fetchCart_fetchCart_data_prescriptionDetails {
  __typename: "PrescriptionDetailsResponse";
  prescriptionImageUrl: string | null;
  prismPrescriptionFileId: string | null;
  uhid: string | null;
  appointmentId: string | null;
  meta: any | null;
}

export interface fetchCart_fetchCart_data_subscriptionDetails {
  __typename: "CartSubscriptionResponse";
  userSubscriptionId: string | null;
  planId: PLAN_ID | null;
  subPlanId: string | null;
  type: PLAN | null;
  planAmount: number | null;
  currentSellingPrice: number | null;
  validDuration: number | null;
  durationInMonth: number | null;
  subscriptionApplied: boolean | null;
}

export interface fetchCart_fetchCart_data_medicineOrderCartLineItems {
  __typename: "LineItemsResponse";
  sku: string | null;
  magentoId: number | null;
  magentoStatus: string | null;
  name: string | null;
  quantity: number | null;
  price: number | null;
  sellingPrice: number | null;
  mou: string | null;
  couponDiscountPrice: number | null;
  thumbnail: string | null;
  isExpress: string | null;
  isPrescriptionRequired: string | null;
  subcategory: string | null;
  typeId: string | null;
  urlKey: string | null;
  isInStock: number | null;
  maxOrderQty: number | null;
  sellOnline: number | null;
  tat: string | null;
  tatDuration: string | null;
  isCouponApplicable: CouponApplicable | null;
  cashback: number | null;
  isShippable: boolean | null;
  freeProduct: boolean | null;
  shipmentNo: number | null;
  tatCity: string | null;
  storeType: string | null;
}

export interface fetchCart_fetchCart_data {
  __typename: "CartDataResponse";
  patientId: string;
  amount: fetchCart_fetchCart_data_amount;
  noOfShipments: number | null;
  longitude: number | null;
  latitude: number | null;
  zipcode: string | null;
  city: string | null;
  state: string | null;
  patientAddressId: string | null;
  couponDetails: fetchCart_fetchCart_data_couponDetails | null;
  prescriptionDetails: (fetchCart_fetchCart_data_prescriptionDetails | null)[] | null;
  prescriptionType: PrescriptionType | null;
  subscriptionDetails: fetchCart_fetchCart_data_subscriptionDetails | null;
  medicineOrderCartLineItems: fetchCart_fetchCart_data_medicineOrderCartLineItems[] | null;
}

export interface fetchCart_fetchCart {
  __typename: "CartResponse";
  statusCode: number | null;
  errorMessage: string | null;
  cartMessage: string | null;
  data: fetchCart_fetchCart_data | null;
}

export interface fetchCart {
  fetchCart: fetchCart_fetchCart;
}

export interface fetchCartVariables {
  patientId: string;
}
