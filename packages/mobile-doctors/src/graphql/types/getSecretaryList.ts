/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getSecretaryList
// ====================================================

export interface getSecretaryList_getSecretaryList {
  __typename: "SecretaryDetails";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface getSecretaryList {
  getSecretaryList: (getSecretaryList_getSecretaryList | null)[] | null;
}
