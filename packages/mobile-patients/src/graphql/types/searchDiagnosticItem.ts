/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DIAGNOSTICS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: searchDiagnosticItem
// ====================================================

export interface searchDiagnosticItem_searchDiagnosticItem_data_diagnostic_item_price {
  __typename: "diagnosticPricing";
  status: string | null;
  startDate: any | null;
  endDate: any | null;
  price: number;
  mrp: number;
  couponCode: string | null;
  groupPlan: string;
}

export interface searchDiagnosticItem_searchDiagnosticItem_data_diagnostic_inclusions_test_parameter_data {
  __typename: "Observation";
  mandatoryValue: string | null;
  observationName: string | null;
}

export interface searchDiagnosticItem_searchDiagnosticItem_data {
  __typename: "DiagnosticsItemData";
  diagnostic_item_id: number | null;
  diagnostic_item_name: string | null;
  diagnostic_inclusions: (string | null)[] | null;
  diagnostic_item_alias: string | null;
  diagnostic_item_price: (searchDiagnosticItem_searchDiagnosticItem_data_diagnostic_item_price | null)[] | null;
  diagnostic_item_packageCalculatedMrp: number | null;
  diagnostic_item_itemType: DIAGNOSTICS_TYPE | null;
  diagnostic_item_alias_names: string | null;
  diagnostic_inclusions_test_parameter_data: (searchDiagnosticItem_searchDiagnosticItem_data_diagnostic_inclusions_test_parameter_data | null)[] | null;
}

export interface searchDiagnosticItem_searchDiagnosticItem {
  __typename: "DiagnosticSearchResponse";
  data: (searchDiagnosticItem_searchDiagnosticItem_data | null)[] | null;
}

export interface searchDiagnosticItem {
  searchDiagnosticItem: searchDiagnosticItem_searchDiagnosticItem | null;
}

export interface searchDiagnosticItemVariables {
  keyword: string;
  cityId: number;
  size?: number | null;
}
