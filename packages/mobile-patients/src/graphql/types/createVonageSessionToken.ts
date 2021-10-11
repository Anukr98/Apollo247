/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: createVonageSessionToken
// ====================================================

export interface createVonageSessionToken_createVonageSessionToken {
  __typename: "createVonageSessionTokenResult";
  token: string | null;
  sessionId: string | null;
}

export interface createVonageSessionToken {
  createVonageSessionToken: createVonageSessionToken_createVonageSessionToken | null;
}

export interface createVonageSessionTokenVariables {
  appointmentId: string;
}
