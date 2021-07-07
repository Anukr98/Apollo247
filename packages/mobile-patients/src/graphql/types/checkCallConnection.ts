/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CheckCallConnectionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: checkCallConnection
// ====================================================

export interface checkCallConnection_checkCallConnection {
  __typename: "CheckCallConnectionInputOutput";
  success: boolean | null;
}

export interface checkCallConnection {
  checkCallConnection: checkCallConnection_checkCallConnection;
}

export interface checkCallConnectionVariables {
  CheckCallConnectionInput: CheckCallConnectionInput;
}
