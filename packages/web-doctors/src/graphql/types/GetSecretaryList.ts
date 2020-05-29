/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSecretaryList
// ====================================================

export interface GetSecretaryList_getSecretaryList {
  __typename: "SecretaryDetails";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface GetSecretaryList {
  getSecretaryList: (GetSecretaryList_getSecretaryList | null)[] | null;
}
