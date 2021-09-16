/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllUserSubscriptionsWithPlanBenefitsV2
// ====================================================

export interface GetAllUserSubscriptionsWithPlanBenefitsV2_GetAllUserSubscriptionsWithPlanBenefitsV2 {
  __typename: "GetGenericJSONResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: any | null;
}

export interface GetAllUserSubscriptionsWithPlanBenefitsV2 {
  GetAllUserSubscriptionsWithPlanBenefitsV2: GetAllUserSubscriptionsWithPlanBenefitsV2_GetAllUserSubscriptionsWithPlanBenefitsV2;
}

export interface GetAllUserSubscriptionsWithPlanBenefitsV2Variables {
  mobile_number: string;
}
