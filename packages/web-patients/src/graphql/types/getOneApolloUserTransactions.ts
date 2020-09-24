/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getOneApolloUserTransactions
// ====================================================

export interface getOneApolloUserTransactions_getOneApolloUserTransactions {
  __typename: "TransactionDetails";
  earnedHC: number;
  transactionDate: string;
  grossAmount: number;
  netAmount: number;
  businessUnit: string;
  redeemedHC: number;
}

export interface getOneApolloUserTransactions {
  getOneApolloUserTransactions: (getOneApolloUserTransactions_getOneApolloUserTransactions | null)[] | null;
}
