/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getCMSIdentifierByDomain
// ====================================================

export interface getCMSIdentifierByDomain_getCMSIdentifierByDomain {
  __typename: "getCMSIdentifierByDomainResponse";
  success: boolean | null;
  groupIdentifier: string | null;
}

export interface getCMSIdentifierByDomain {
  getCMSIdentifierByDomain: getCMSIdentifierByDomain_getCMSIdentifierByDomain | null;
}

export interface getCMSIdentifierByDomainVariables {
  email: string;
}
