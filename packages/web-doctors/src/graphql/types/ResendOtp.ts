/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { LOGIN_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: ResendOtp
// ====================================================

export interface ResendOtp_resendOtp {
  __typename: "LoginResult";
  status: boolean;
  message: string | null;
  loginId: string | null;
}

export interface ResendOtp {
  resendOtp: ResendOtp_resendOtp;
}

export interface ResendOtpVariables {
  mobileNumber: string;
  id: string;
  loginType: LOGIN_TYPE;
}
