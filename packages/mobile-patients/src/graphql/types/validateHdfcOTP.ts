/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: validateHdfcOTP
// ====================================================

export interface validateHdfcOTP_validateHdfcOTP {
  __typename: "validHdfcCustomerResponse";
  status: boolean | null;
  defaultPlan: string | null;
}

export interface validateHdfcOTP {
  validateHdfcOTP: validateHdfcOTP_validateHdfcOTP | null;
}

export interface validateHdfcOTPVariables {
  otp: string;
  token: string;
  dateOfBirth: any;
}
