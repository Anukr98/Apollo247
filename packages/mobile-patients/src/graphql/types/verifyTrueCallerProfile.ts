/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TrueCallerProfile } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: verifyTrueCallerProfile
// ====================================================

export interface verifyTrueCallerProfile_verifyTrueCallerProfile {
  __typename: "AuthTokenTrueCaller";
  authToken: string | null;
}

export interface verifyTrueCallerProfile {
  verifyTrueCallerProfile: verifyTrueCallerProfile_verifyTrueCallerProfile;
}

export interface verifyTrueCallerProfileVariables {
  profile: TrueCallerProfile;
}
