/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: switchDiagnosticOrderPatientID
// ====================================================

export interface switchDiagnosticOrderPatientID_switchDiagnosticOrderPatientID {
  __typename: "switchDiagnosticOrderPatientIDResponse";
  status: boolean | null;
  message: string | null;
}

export interface switchDiagnosticOrderPatientID {
  switchDiagnosticOrderPatientID: switchDiagnosticOrderPatientID_switchDiagnosticOrderPatientID;
}

export interface switchDiagnosticOrderPatientIDVariables {
  diagnosticOrdersId: string;
  newPatientId: string;
}
