/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPatientLatestPrescriptions
// ====================================================

export interface getPatientLatestPrescriptions_getPatientLatestPrescriptions_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescriptionDiag";
  itemId: number | null;
  itemname: string;
  testInstruction: string | null;
}

export interface getPatientLatestPrescriptions_getPatientLatestPrescriptions_caseSheet {
  __typename: "CaseSheetDiag";
  id: string;
  blobName: string | null;
  diagnosticPrescription: (getPatientLatestPrescriptions_getPatientLatestPrescriptions_caseSheet_diagnosticPrescription | null)[] | null;
}

export interface getPatientLatestPrescriptions_getPatientLatestPrescriptions {
  __typename: "PatientPrescriptionsResponse";
  doctorName: string | null;
  doctorCredentials: string | null;
  patientName: string | null;
  prescriptionDateTime: any | null;
  numberOfTests: number | null;
  orderCount: number | null;
  caseSheet: getPatientLatestPrescriptions_getPatientLatestPrescriptions_caseSheet | null;
}

export interface getPatientLatestPrescriptions {
  getPatientLatestPrescriptions: (getPatientLatestPrescriptions_getPatientLatestPrescriptions | null)[] | null;
}

export interface getPatientLatestPrescriptionsVariables {
  patientId: string;
  limit: number;
  cityId: number;
}
