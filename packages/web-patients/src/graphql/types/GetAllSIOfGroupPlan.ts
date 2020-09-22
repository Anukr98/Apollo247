/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AttributeType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAllSIOfGroupPlan
// ====================================================

export interface GetAllSIOfGroupPlan_GetAllSubscriptionInclusionsOfGroupPlan_response_group_plan {
  __typename: "GroupPlanType";
  name: string;
  plan_id: string;
}

export interface GetAllSIOfGroupPlan_GetAllSubscriptionInclusionsOfGroupPlan_response {
  __typename: "SubscriptionInclusionsType";
  attribute: string;
  description: string;
  header_content: string;
  cta_label: string;
  cta_action: any;
  attribute_type: AttributeType;
  available_count: number;
  refresh_frequency: number;
  group_plan: GetAllSIOfGroupPlan_GetAllSubscriptionInclusionsOfGroupPlan_response_group_plan;
}

export interface GetAllSIOfGroupPlan_GetAllSubscriptionInclusionsOfGroupPlan {
  __typename: "GetAllSubscriptionInclusionsResponse";
  code: number;
  message: string | null;
  success: boolean;
  response: GetAllSIOfGroupPlan_GetAllSubscriptionInclusionsOfGroupPlan_response[] | null;
}

export interface GetAllSIOfGroupPlan {
  GetAllSubscriptionInclusionsOfGroupPlan: GetAllSIOfGroupPlan_GetAllSubscriptionInclusionsOfGroupPlan;
}

export interface GetAllSIOfGroupPlanVariables {
  groupPlanId: string;
}
