/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE, TEST_COLLECTION_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: searchDiagnosticsById
// ====================================================

export interface searchDiagnosticsById_searchDiagnosticsById_diagnostics {
  __typename: "Diagnostics";
  id: string;
  itemId: number;
  itemName: string;
  itemType: DIAGNOSTICS_TYPE | null;
  rate: number;
  gender: string;
  itemRemarks: string;
  city: string;
  state: string;
  collectionType: TEST_COLLECTION_TYPE | null;
  fromAgeInDays: number;
  toAgeInDays: number;
  testDescription: string | null;
  testPreparationData: string;
  inclusions: (number | null)[] | null;
}

export interface searchDiagnosticsById_searchDiagnosticsById {
  __typename: "SearchDiagnosticsResult";
  diagnostics: (searchDiagnosticsById_searchDiagnosticsById_diagnostics | null)[] | null;
}

export interface searchDiagnosticsById {
  searchDiagnosticsById: searchDiagnosticsById_searchDiagnosticsById;
}

export interface searchDiagnosticsByIdVariables {
  itemIds?: string | null;
}
