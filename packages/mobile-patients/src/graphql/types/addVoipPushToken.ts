/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { voipPushTokenInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addVoipPushToken
// ====================================================

export interface addVoipPushToken_addVoipPushToken {
  __typename: "voipPushTokenResult";
  isError: boolean | null;
  response: string | null;
  patientId: string | null;
  voipToken: string | null;
}

export interface addVoipPushToken {
  addVoipPushToken: addVoipPushToken_addVoipPushToken;
}

export interface addVoipPushTokenVariables {
  voipPushTokenInput: voipPushTokenInput;
}
