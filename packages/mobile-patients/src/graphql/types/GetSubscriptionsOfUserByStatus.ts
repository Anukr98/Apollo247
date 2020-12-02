/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSubscriptionsOfUserByStatus
// ====================================================

export interface GetSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus {
  __typename: "GetGenericJSONResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: any | null;
}

export interface GetSubscriptionsOfUserByStatus {
  GetSubscriptionsOfUserByStatus: GetSubscriptionsOfUserByStatus_GetSubscriptionsOfUserByStatus;
}

export interface GetSubscriptionsOfUserByStatusVariables {
  mobile_number: string;
  status: string[];
}
