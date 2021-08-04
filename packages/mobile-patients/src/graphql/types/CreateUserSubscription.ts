/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateUserSubscriptionInput, SubscriptionStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateUserSubscription
// ====================================================

export interface CreateUserSubscription_CreateUserSubscription_response_group_plan {
  __typename: "GroupPlanType";
  name: string;
  plan_id: string;
}

export interface CreateUserSubscription_CreateUserSubscription_response {
  __typename: "UserSubscription";
  _id: string | null;
  mobile_number: string;
  status: SubscriptionStatus;
  start_date: any;
  end_date: any;
  group_plan: CreateUserSubscription_CreateUserSubscription_response_group_plan;
}

export interface CreateUserSubscription_CreateUserSubscription {
  __typename: "MutateUserSubscriptionResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: CreateUserSubscription_CreateUserSubscription_response | null;
}

export interface CreateUserSubscription {
  CreateUserSubscription: CreateUserSubscription_CreateUserSubscription;
}

export interface CreateUserSubscriptionVariables {
  userSubscription: CreateUserSubscriptionInput;
}
