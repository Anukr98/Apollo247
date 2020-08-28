/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LOGIN_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: Login
// ====================================================

export interface Login_login {
  __typename: "LoginResult";
  status: boolean;
  message: string | null;
  loginId: string | null;
}

export interface Login {
  login: Login_login;
}

export interface LoginVariables {
  mobileNumber: string;
  loginType: LOGIN_TYPE;
  hashCode?: string | null;
}
