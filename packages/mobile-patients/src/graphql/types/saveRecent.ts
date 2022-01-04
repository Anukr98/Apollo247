/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: saveRecent
// ====================================================

export interface saveRecent_saveRecentSearchData {
  __typename: "RecentSearchTextResponse";
  success: boolean;
}

export interface saveRecent {
  saveRecentSearchData: saveRecent_saveRecentSearchData;
}

export interface saveRecentVariables {
  searchText?: string | null;
}
