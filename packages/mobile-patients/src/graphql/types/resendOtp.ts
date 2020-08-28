/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LOGIN_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: resendOtp
// ====================================================

export interface resendOtp_resendOtp {
  __typename: "LoginResult";
  status: boolean;
  message: string | null;
  loginId: string | null;
}

export interface resendOtp {
  resendOtp: resendOtp_resendOtp;
}

export interface resendOtpVariables {
  mobileNumber: string;
  loginType: LOGIN_TYPE;
  id: string;
}
