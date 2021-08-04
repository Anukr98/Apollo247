/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteCardFromLocker
// ====================================================

export interface deleteCardFromLocker_deleteCardFromLocker {
  __typename: "CardDeletedResponse";
  card_token: string | null;
  deleted: boolean | null;
}

export interface deleteCardFromLocker {
  deleteCardFromLocker: deleteCardFromLocker_deleteCardFromLocker;
}

export interface deleteCardFromLockerVariables {
  cardToken: string;
}
