/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticsHomePageItems
// ====================================================

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans_diagnostics {
  __typename: "Diagnostics";
  rate: number;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans {
  __typename: "DiagnosticOrgans";
  organName: string | null;
  organImage: string | null;
  diagnostics: getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans_diagnostics | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers_diagnostics {
  __typename: "Diagnostics";
  rate: number;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers {
  __typename: "DiagnosticHotSellers";
  packageImage: string | null;
  packageName: string | null;
  diagnostics: getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers_diagnostics | null;
}

export interface getDiagnosticsHomePageItems_getDiagnosticsHomePageItems {
  __typename: "DiagnosticsData";
  diagnosticOrgans: (getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans | null)[] | null;
  diagnosticHotSellers: (getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers | null)[] | null;
}

export interface getDiagnosticsHomePageItems {
  getDiagnosticsHomePageItems: getDiagnosticsHomePageItems_getDiagnosticsHomePageItems;
}

export interface getDiagnosticsHomePageItemsVariables {
  cityID: number;
}
