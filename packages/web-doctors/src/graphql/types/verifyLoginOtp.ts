/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OtpVerificationInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: verifyLoginOtp
// ====================================================

export interface verifyLoginOtp_verifyLoginOtp {
  __typename: "OtpVerificationResult";
  status: boolean;
  authToken: string | null;
  isBlocked: boolean | null;
}

export interface verifyLoginOtp {
  verifyLoginOtp: verifyLoginOtp_verifyLoginOtp;
}

export interface verifyLoginOtpVariables {
  otpVerificationInput?: OtpVerificationInput | null;
}
