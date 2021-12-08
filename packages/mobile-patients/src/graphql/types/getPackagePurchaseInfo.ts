/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PAYMENT_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPackagePurchaseInfo
// ====================================================

export interface getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails_group_plan_meta {
  __typename: "GroupPlanMeta";
  description: string | null;
}

export interface getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails_group_plan {
  __typename: "GroupPlanType";
  meta: getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails_group_plan_meta | null;
}

export interface getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails_group_sub_plan {
  __typename: "GroupSubPlanType";
  plan_id: string;
  name: string;
}

export interface getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails {
  __typename: "UserSubscription";
  end_date: any;
  payment_reference: any;
  group_plan: getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails_group_plan;
  group_sub_plan: getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails_group_sub_plan;
}

export interface getPackagePurchaseInfo_getOrderInternal {
  __typename: "PaymentOrder";
  id: string;
  customer_id: string | null;
  payment_order_id: string;
  payment_status: PAYMENT_STATUS | null;
  total_amount: number;
  SubscriptionOrderDetails: getPackagePurchaseInfo_getOrderInternal_SubscriptionOrderDetails;
}

export interface getPackagePurchaseInfo {
  getOrderInternal: getPackagePurchaseInfo_getOrderInternal | null;
}

export interface getPackagePurchaseInfoVariables {
  order_id: string;
}
