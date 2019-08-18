/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SaveSearchInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveSearch
// ====================================================

export interface SaveSearch_saveSearch {
  __typename: "SaveSearchResult";
  saveStatus: boolean | null;
}

export interface SaveSearch {
  saveSearch: SaveSearch_saveSearch;
}

export interface SaveSearchVariables {
  saveSearchInput?: SaveSearchInput | null;
}
