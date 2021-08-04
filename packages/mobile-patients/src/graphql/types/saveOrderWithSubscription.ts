/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SaveMedicineOrderV2Input, CreateUserSubscriptionInput, SubscriptionStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveOrderWithSubscription
// ====================================================

export interface saveOrderWithSubscription_saveMedicineOrderV2_orders {
  __typename: "MedicineOrderIds";
  id: string;
  orderAutoId: number | null;
  estimatedAmount: number | null;
}

export interface saveOrderWithSubscription_saveMedicineOrderV2 {
  __typename: "SaveMedicineOrderV2Result";
  errorCode: number | null;
  errorMessage: string | null;
  transactionId: number | null;
  orders: (saveOrderWithSubscription_saveMedicineOrderV2_orders | null)[] | null;
}

export interface saveOrderWithSubscription_CreateUserSubscription_response_group_plan {
  __typename: "GroupPlanType";
  name: string;
  plan_id: string;
}

export interface saveOrderWithSubscription_CreateUserSubscription_response {
  __typename: "UserSubscription";
  _id: string | null;
  mobile_number: string;
  status: SubscriptionStatus;
  start_date: any;
  end_date: any;
  group_plan: saveOrderWithSubscription_CreateUserSubscription_response_group_plan;
}

export interface saveOrderWithSubscription_CreateUserSubscription {
  __typename: "MutateUserSubscriptionResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: saveOrderWithSubscription_CreateUserSubscription_response | null;
}

export interface saveOrderWithSubscription {
  saveMedicineOrderV2: saveOrderWithSubscription_saveMedicineOrderV2;
  CreateUserSubscription: saveOrderWithSubscription_CreateUserSubscription;
}

export interface saveOrderWithSubscriptionVariables {
  medicineOrderInput: SaveMedicineOrderV2Input;
  userSubscription: CreateUserSubscriptionInput;
}
