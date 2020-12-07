/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SEARCH_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPastSearches
// ====================================================

export interface getPastSearches_getPastSearches {
  __typename: "SearchData";
  searchType: SEARCH_TYPE | null;
  typeId: string | null;
  name: string | null;
  image: string | null;
}

export interface getPastSearches {
  getPastSearches: (getPastSearches_getPastSearches | null)[] | null;
}
