/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddSecretary
// ====================================================

export interface AddSecretary_addSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
  mobileNumber: string;
}

export interface AddSecretary_addSecretary {
  __typename: "DoctorSecretaryData";
  secretary: AddSecretary_addSecretary_secretary | null;
}

export interface AddSecretary {
  addSecretary: AddSecretary_addSecretary | null;
}

export interface AddSecretaryVariables {
  secretaryId: string;
}
