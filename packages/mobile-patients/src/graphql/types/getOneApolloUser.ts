/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getOneApolloUser
// ====================================================

export interface getOneApolloUser_getOneApolloUser {
  __typename: "UserDetailResponse";
  name: string | null;
  earnedHC: number;
  availableHC: number;
  tier: string;
}

export interface getOneApolloUser {
  getOneApolloUser: getOneApolloUser_getOneApolloUser | null;
}

export interface getOneApolloUserVariables {
  patientId: string;
}
