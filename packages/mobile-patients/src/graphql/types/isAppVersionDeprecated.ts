/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IsAppVersionDeprecatedInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: isAppVersionDeprecated
// ====================================================

export interface isAppVersionDeprecated_isAppVersionDeprecated {
  __typename: "IsAppVersionDeprecatedResult";
  statusCode: string;
  message: string | null;
  success: boolean;
  redirectURI: string | null;
}

export interface isAppVersionDeprecated {
  isAppVersionDeprecated: isAppVersionDeprecated_isAppVersionDeprecated;
}

export interface isAppVersionDeprecatedVariables {
  isAppVersionDeprecatedInput?: IsAppVersionDeprecatedInput | null;
}
