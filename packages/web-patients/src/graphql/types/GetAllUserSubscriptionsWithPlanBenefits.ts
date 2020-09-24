/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllUserSubscriptionsWithPlanBenefits
// ====================================================

export interface GetAllUserSubscriptionsWithPlanBenefits_GetAllUserSubscriptionsWithPlanBenefits {
  __typename: "GetAllUserSubscriptionsResponse";
  code: number;
  message: string | null;
  success: boolean;
  response: any | null;
}

export interface GetAllUserSubscriptionsWithPlanBenefits {
  GetAllUserSubscriptionsWithPlanBenefits: GetAllUserSubscriptionsWithPlanBenefits_GetAllUserSubscriptionsWithPlanBenefits;
}

export interface GetAllUserSubscriptionsWithPlanBenefitsVariables {
  mobile_number: string;
}
