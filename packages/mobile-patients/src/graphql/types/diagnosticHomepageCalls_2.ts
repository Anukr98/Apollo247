/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: diagnosticHomepageCalls_2
// ====================================================

export interface diagnosticHomepageCalls_2_getPatientLatestPrescriptions_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescriptionDiag";
  itemId: number | null;
  itemname: string;
  gender: string | null;
  testInstruction: string | null;
}

export interface diagnosticHomepageCalls_2_getPatientLatestPrescriptions_caseSheet {
  __typename: "CaseSheetDiag";
  id: string;
  blobName: string | null;
  diagnosticPrescription: (diagnosticHomepageCalls_2_getPatientLatestPrescriptions_caseSheet_diagnosticPrescription | null)[] | null;
}

export interface diagnosticHomepageCalls_2_getPatientLatestPrescriptions {
  __typename: "PatientPrescriptionsResponse";
  doctorName: string | null;
  doctorCredentials: string | null;
  patientName: string | null;
  prescriptionDateTime: any | null;
  numberOfTests: number | null;
  orderCount: number | null;
  caseSheet: diagnosticHomepageCalls_2_getPatientLatestPrescriptions_caseSheet | null;
}

export interface diagnosticHomepageCalls_2_GetSubscriptionsOfUserByStatus {
  __typename: "GetGenericJSONResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: any | null;
}

export interface diagnosticHomepageCalls_2 {
  getPatientLatestPrescriptions: (diagnosticHomepageCalls_2_getPatientLatestPrescriptions | null)[] | null;
  GetSubscriptionsOfUserByStatus: diagnosticHomepageCalls_2_GetSubscriptionsOfUserByStatus;
}

export interface diagnosticHomepageCalls_2Variables {
  mobile_number: string;
  prescriptionLimit: number;
  cityId: number;
  status: string[];
}
