/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SubscriptionStatus, GroupPlanStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: getSubscriptionsOfUserByStatus
// ====================================================

export interface getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus_response_group_plan_group {
  __typename: "GroupType";
  name: string;
}

export interface getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus_response_group_plan {
  __typename: "GroupPlanType";
  group: getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus_response_group_plan_group;
  _id: string | null;
  plan_id: string;
  name: string;
  status: GroupPlanStatus;
}

export interface getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus_response {
  __typename: "UserSubscription";
  _id: string | null;
  status: SubscriptionStatus;
  group_plan: getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus_response_group_plan;
}

export interface getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus {
  __typename: "GetSubscriptionsOfUserByStatusResponse";
  code: number;
  message: string | null;
  success: boolean;
  response: getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus_response[] | null;
}

export interface getSubscriptionsOfUserByStatus {
  GetSubscriptionsOfUserByStatus: getSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus;
}

export interface getSubscriptionsOfUserByStatusVariables {
  mobile_number: string;
  status: string[];
}
