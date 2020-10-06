/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticsCites
// ====================================================

export interface getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities {
  __typename: "DiagnosticCities";
  cityname: string;
  statename: string;
  cityid: number;
  stateid: number;
}

export interface getDiagnosticsCites_getDiagnosticsCites {
  __typename: "GetAllCitiesResult";
  diagnosticsCities: (getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities | null)[] | null;
}

export interface getDiagnosticsCites {
  getDiagnosticsCites: getDiagnosticsCites_getDiagnosticsCites;
}

export interface getDiagnosticsCitesVariables {
  patientId?: string | null;
  cityName?: string | null;
}
