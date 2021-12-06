/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CancelSubscriptionInput, SubscriptionStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CancelSubscription
// ====================================================

export interface CancelSubscription_CancelSubscription_response {
  __typename: "UserSubscription";
  mobile_number: string;
  status: SubscriptionStatus;
  _id: string | null;
  start_date: any;
  end_date: any;
}

export interface CancelSubscription_CancelSubscription {
  __typename: "MutateUserSubscriptionResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: CancelSubscription_CancelSubscription_response | null;
}

export interface CancelSubscription {
  CancelSubscription: CancelSubscription_CancelSubscription;
}

export interface CancelSubscriptionVariables {
  CancelSubscriptionInput: CancelSubscriptionInput;
}
