/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PHARMACY_USER_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getUserProfileType
// ====================================================

export interface getUserProfileType_getUserProfileType {
  __typename: "userProfileResult";
  profile: PHARMACY_USER_TYPE | null;
}

export interface getUserProfileType {
  getUserProfileType: getUserProfileType_getUserProfileType;
}

export interface getUserProfileTypeVariables {
  mobileNumber: string;
}
