/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPrismAuthToken
// ====================================================

export interface getPrismAuthToken_getPrismAuthToken {
  __typename: "PrismAuthTokenResponse";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: string | null;
}

export interface getPrismAuthToken {
  getPrismAuthToken: getPrismAuthToken_getPrismAuthToken | null;
}

export interface getPrismAuthTokenVariables {
  uhid: string;
}
