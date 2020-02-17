/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: addSecretary
// ====================================================

export interface addSecretary_addSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
}

export interface addSecretary_addSecretary {
  __typename: "DoctorSecretaryData";
  secretary: addSecretary_addSecretary_secretary | null;
}

export interface addSecretary {
  addSecretary: addSecretary_addSecretary | null;
}

export interface addSecretaryVariables {
  secretaryId: string;
}
