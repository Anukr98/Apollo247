/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: findDiagnosticsWidgetsPricing
// ====================================================

export interface findDiagnosticsWidgetsPricing_findDiagnosticsWidgetsPricing_diagnostics_diagnosticPricing {
  __typename: "diagnosticPricing";
  mrp: number;
  price: number;
  groupPlan: string;
  status: string | null;
  startDate: any | null;
  endDate: any | null;
}

export interface findDiagnosticsWidgetsPricing_findDiagnosticsWidgetsPricing_diagnostics {
  __typename: "findDiagnosticWidgetsPricingResult";
  itemId: number | null;
  packageCalculatedMrp: number | null;
  diagnosticPricing: (findDiagnosticsWidgetsPricing_findDiagnosticsWidgetsPricing_diagnostics_diagnosticPricing | null)[] | null;
}

export interface findDiagnosticsWidgetsPricing_findDiagnosticsWidgetsPricing {
  __typename: "findDiagnosticsWidgetsPricingResult";
  diagnostics: (findDiagnosticsWidgetsPricing_findDiagnosticsWidgetsPricing_diagnostics | null)[] | null;
}

export interface findDiagnosticsWidgetsPricing {
  findDiagnosticsWidgetsPricing: findDiagnosticsWidgetsPricing_findDiagnosticsWidgetsPricing;
}

export interface findDiagnosticsWidgetsPricingVariables {
  cityID: number;
  itemIDs: (number | null)[];
}
