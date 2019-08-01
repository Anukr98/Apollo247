/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SEARCH_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPastSearches
// ====================================================

export interface GetPastSearches_getPastSearches {
  __typename: "SearchData";
  searchType: SEARCH_TYPE | null;
  typeId: string | null;
  name: string | null;
  image: string | null;
}

export interface GetPastSearches {
  getPastSearches: (GetPastSearches_getPastSearches | null)[] | null;
}
