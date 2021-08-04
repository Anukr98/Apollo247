/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MedicineCartOMSInput, CreateUserSubscriptionInput, SubscriptionStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: savePickUpOrderWithSubscription
// ====================================================

export interface savePickUpOrderWithSubscription_saveMedicineOrderOMS {
  __typename: "SaveMedicineOrderResult";
  errorCode: number | null;
  errorMessage: string | null;
  orderId: string;
  orderAutoId: number;
}

export interface savePickUpOrderWithSubscription_CreateUserSubscription_response_group_plan {
  __typename: "GroupPlanType";
  name: string;
  plan_id: string;
}

export interface savePickUpOrderWithSubscription_CreateUserSubscription_response {
  __typename: "UserSubscription";
  _id: string | null;
  mobile_number: string;
  status: SubscriptionStatus;
  start_date: any;
  end_date: any;
  group_plan: savePickUpOrderWithSubscription_CreateUserSubscription_response_group_plan;
}

export interface savePickUpOrderWithSubscription_CreateUserSubscription {
  __typename: "MutateUserSubscriptionResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: savePickUpOrderWithSubscription_CreateUserSubscription_response | null;
}

export interface savePickUpOrderWithSubscription {
  saveMedicineOrderOMS: savePickUpOrderWithSubscription_saveMedicineOrderOMS;
  CreateUserSubscription: savePickUpOrderWithSubscription_CreateUserSubscription;
}

export interface savePickUpOrderWithSubscriptionVariables {
  medicineCartOMSInput: MedicineCartOMSInput;
  userSubscription: CreateUserSubscriptionInput;
}
