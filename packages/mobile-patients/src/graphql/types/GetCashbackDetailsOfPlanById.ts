/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCashbackDetailsOfPlanById
// ====================================================

export interface GetCashbackDetailsOfPlanById_GetCashbackDetailsOfPlanById {
  __typename: "GetCashbackDetailsOfCarePlanResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: any | null;
}

export interface GetCashbackDetailsOfPlanById {
  GetCashbackDetailsOfPlanById: GetCashbackDetailsOfPlanById_GetCashbackDetailsOfPlanById;
}

export interface GetCashbackDetailsOfPlanByIdVariables {
  plan_id: string;
}
