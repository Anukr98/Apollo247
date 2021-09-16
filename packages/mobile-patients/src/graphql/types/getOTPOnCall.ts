/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LOGIN_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getOTPOnCall
// ====================================================

export interface getOTPOnCall_getOTPOnCall {
  __typename: "LoginResult";
  status: boolean;
  loginId: string | null;
  message: string | null;
}

export interface getOTPOnCall {
  getOTPOnCall: getOTPOnCall_getOTPOnCall;
}

export interface getOTPOnCallVariables {
  mobileNumber?: string | null;
  loginType?: LOGIN_TYPE | null;
  id: string;
}
