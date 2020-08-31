/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserIdentification, SubscriptionStatus, Status } from "./globalTypes";

// ====================================================
// GraphQL query operation: getSubscriptionsOfUserByStatus
// ====================================================

export interface getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response_group_plan_group {
  __typename: "Group";
  name: string | null;
  is_active: boolean | null;
}

export interface getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response_group_plan {
  __typename: "GroupPlan";
  plan_id: string | null;
  name: string | null;
  status: Status | null;
  group: getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response_group_plan_group | null;
}

export interface getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response {
  __typename: "UserSubscription";
  _id: string | null;
  status: SubscriptionStatus | null;
  coupon_availed: string | null;
  group_plan: getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response_group_plan | null;
}

export interface getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus {
  __typename: "getSubscriptionsOfUserResponse";
  code: number | null;
  message: string | null;
  success: boolean | null;
  response: (getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response | null)[] | null;
}

export interface getSubscriptionsOfUserByStatus {
  getSubscriptionsOfUserByStatus: getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus | null;
}

export interface getSubscriptionsOfUserByStatusVariables {
  user?: UserIdentification | null;
  status?: (string | null)[] | null;
}
