/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SaveSearchInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveSearch
// ====================================================

export interface saveSearch_saveSearch {
  __typename: "SaveSearchResult";
  saveStatus: boolean | null;
}

export interface saveSearch {
  saveSearch: saveSearch_saveSearch;
}

export interface saveSearchVariables {
  saveSearchInput: SaveSearchInput;
}
