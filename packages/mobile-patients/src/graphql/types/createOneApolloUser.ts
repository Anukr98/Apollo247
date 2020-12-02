/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: createOneApolloUser
// ====================================================

export interface createOneApolloUser_createOneApolloUser {
  __typename: "CreateOneApolloUserResult";
  success: boolean | null;
  message: string | null;
}

export interface createOneApolloUser {
  createOneApolloUser: createOneApolloUser_createOneApolloUser | null;
}

export interface createOneApolloUserVariables {
  patientId: string;
}
