/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CowinLoginVerifyInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CowinLoginVerify
// ====================================================

export interface CowinLoginVerify_cowinLoginVerify_response {
  __typename: "CowinLoginVerify";
  txnId: string | null;
  token: string | null;
  errorCode: string | null;
  error: string | null;
}

export interface CowinLoginVerify_cowinLoginVerify {
  __typename: "CowinLoginVerifyResponse";
  code: number;
  message: string | null;
  response: CowinLoginVerify_cowinLoginVerify_response | null;
}

export interface CowinLoginVerify {
  cowinLoginVerify: CowinLoginVerify_cowinLoginVerify;
}

export interface CowinLoginVerifyVariables {
  cowinLoginVerify: CowinLoginVerifyInput;
}
