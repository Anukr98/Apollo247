/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserIdentification, SubscriptionStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: getSubscriptionsOfUserByStatus
// ====================================================

export interface getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response_group_plan {
  __typename: "GroupPlan";
  name: string | null;
}

export interface getSubscriptionsOfUserByStatus_getSubscriptionsOfUserByStatus_response {
  __typename: "UserSubscription";
  status: SubscriptionStatus | null;
  transaction_date_time: any | null;
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
