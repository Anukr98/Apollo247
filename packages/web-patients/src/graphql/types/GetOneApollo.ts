/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOneApollo
// ====================================================

export interface GetOneApollo_getOneApolloUser {
  __typename: "UserDetailResponse";
  availableHC: number;
  name: string | null;
  earnedHC: number;
  tier: string;
  burnedCredits: number;
  blockedCredits: number | null;
}

export interface GetOneApollo {
  getOneApolloUser: GetOneApollo_getOneApolloUser | null;
}

export interface GetOneApolloVariables {
  patientId?: string | null;
}
