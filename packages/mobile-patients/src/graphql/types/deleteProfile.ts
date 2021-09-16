/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteProfile
// ====================================================

export interface deleteProfile_deleteProfile {
  __typename: "DeleteProfileResult";
  status: boolean;
}

export interface deleteProfile {
  deleteProfile: deleteProfile_deleteProfile;
}

export interface deleteProfileVariables {
  patientId?: string | null;
}
