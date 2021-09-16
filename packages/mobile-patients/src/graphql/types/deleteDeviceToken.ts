/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteDeviceToken
// ====================================================

export interface deleteDeviceToken_deleteDeviceToken {
  __typename: "DeleteTokenResult";
  status: boolean;
}

export interface deleteDeviceToken {
  deleteDeviceToken: deleteDeviceToken_deleteDeviceToken;
}

export interface deleteDeviceTokenVariables {
  deviceToken?: string | null;
  patientId?: string | null;
}
