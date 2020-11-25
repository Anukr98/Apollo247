/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCircleSavingsOfUserByMobile
// ====================================================

export interface GetCircleSavingsOfUserByMobile_GetCircleSavingsOfUserByMobile {
  __typename: "GetGenericJSONResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: any | null;
}

export interface GetCircleSavingsOfUserByMobile {
  GetCircleSavingsOfUserByMobile: GetCircleSavingsOfUserByMobile_GetCircleSavingsOfUserByMobile;
}

export interface GetCircleSavingsOfUserByMobileVariables {
  mobile_number: string;
}
