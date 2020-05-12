/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteProfile
// ====================================================

export interface DeleteProfile_deleteProfile {
  __typename: "DeleteProfileResult";
  status: boolean;
}

export interface DeleteProfile {
  deleteProfile: DeleteProfile_deleteProfile;
}

export interface DeleteProfileVariables {
  patientId?: string | null;
}
