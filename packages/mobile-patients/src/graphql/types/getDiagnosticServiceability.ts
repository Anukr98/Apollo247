/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticServiceability
// ====================================================

export interface getDiagnosticServiceability_getDiagnosticServiceability_serviceability {
  __typename: "diagnosticsServiceability";
  cityID: number | null;
  stateID: number | null;
  state: string | null;
  city: string | null;
}

export interface getDiagnosticServiceability_getDiagnosticServiceability {
  __typename: "getDiagnosticServiceabilityResponse";
  status: boolean | null;
  serviceability: getDiagnosticServiceability_getDiagnosticServiceability_serviceability | null;
}

export interface getDiagnosticServiceability {
  getDiagnosticServiceability: getDiagnosticServiceability_getDiagnosticServiceability;
}

export interface getDiagnosticServiceabilityVariables {
  latitude: number;
  longitude: number;
}
