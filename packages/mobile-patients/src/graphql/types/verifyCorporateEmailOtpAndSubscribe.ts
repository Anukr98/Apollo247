/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CorporateEmailOtpInput, OTP_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: verifyCorporateEmailOtpAndSubscribe
// ====================================================

export interface verifyCorporateEmailOtpAndSubscribe_verifyCorporateEmailOtpAndSubscribe {
  __typename: "verifyCorporateEmailOtpResult";
  status: boolean;
  reason: OTP_STATUS | null;
  isBlocked: boolean | null;
  incorrectAttempts: number | null;
  isSubscriptionSkipped: boolean | null;
}

export interface verifyCorporateEmailOtpAndSubscribe {
  verifyCorporateEmailOtpAndSubscribe: verifyCorporateEmailOtpAndSubscribe_verifyCorporateEmailOtpAndSubscribe;
}

export interface verifyCorporateEmailOtpAndSubscribeVariables {
  corporateEmailOtpInput: CorporateEmailOtpInput;
}
