/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveSecretary
// ====================================================

export interface RemoveSecretary_removeSecretary {
  __typename: "DoctorDetails";
  id: string;
  mobileNumber: string;
}

export interface RemoveSecretary {
  removeSecretary: RemoveSecretary_removeSecretary | null;
}

export interface RemoveSecretaryVariables {
  secretaryId: string;
}
