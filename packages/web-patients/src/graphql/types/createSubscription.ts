/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateUserSubscriptionInput, SubscriptionStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: createSubscription
// ====================================================

export interface createSubscription_createSubscription_response_group_plan {
  __typename: "GroupPlan";
  name: string | null;
}

export interface createSubscription_createSubscription_response {
  __typename: "UserSubscription";
  status: SubscriptionStatus | null;
  transaction_date_time: any | null;
  group_plan: createSubscription_createSubscription_response_group_plan | null;
}

export interface createSubscription_createSubscription {
  __typename: "SubscriptionMutationResponse";
  code: number | null;
  success: boolean | null;
  message: string | null;
  response: createSubscription_createSubscription_response | null;
}

export interface createSubscription {
  createSubscription: createSubscription_createSubscription | null;
}

export interface createSubscriptionVariables {
  userSubscription?: CreateUserSubscriptionInput | null;
}
