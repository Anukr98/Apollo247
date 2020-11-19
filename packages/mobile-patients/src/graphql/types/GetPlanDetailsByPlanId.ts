/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPlanDetailsByPlanId
// ====================================================

export interface GetPlanDetailsByPlanId_GetPlanDetailsByPlanId_response {
  __typename: "GroupPlanType";
  _id: string | null;
  name: string;
  plan_id: string;
  plan_summary: any | null;
}

export interface GetPlanDetailsByPlanId_GetPlanDetailsByPlanId {
  __typename: "GetPlanDetailsByPlanIdResponse";
  response: GetPlanDetailsByPlanId_GetPlanDetailsByPlanId_response | null;
}

export interface GetPlanDetailsByPlanId {
  GetPlanDetailsByPlanId: GetPlanDetailsByPlanId_GetPlanDetailsByPlanId;
}

export interface GetPlanDetailsByPlanIdVariables {
  plan_id: string;
}
