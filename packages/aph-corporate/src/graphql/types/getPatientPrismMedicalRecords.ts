/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPatientPrismMedicalRecords
// ====================================================

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests_labTestResultParameters {
  __typename: "LabTestResultParameter";
  parameterName: string | null;
  unit: string | null;
  result: string | null;
  range: string | null;
  setOutOfRange: boolean | null;
  setResultDate: boolean | null;
  setUnit: boolean | null;
  setParameterName: boolean | null;
  setRange: boolean | null;
  setResult: boolean | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests {
  __typename: "LabTestResult";
  id: string | null;
  labTestName: string | null;
  labTestSource: string | null;
  labTestDate: string | null;
  labTestReferredBy: string | null;
  additionalNotes: string | null;
  testResultPrismFileIds: (string | null)[] | null;
  observation: string | null;
  labTestResultParameters: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests_labTestResultParameters | null)[] | null;
  departmentName: string | null;
  signingDocName: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks {
  __typename: "HealthCheckResult";
  id: string | null;
  healthCheckName: string | null;
  healthCheckDate: string | null;
  healthCheckPrismFileIds: (string | null)[] | null;
  healthCheckSummary: string | null;
  source: string | null;
  appointmentDate: string | null;
  followupDate: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations {
  __typename: "HospitalizationResult";
  id: string | null;
  diagnosisNotes: string | null;
  dateOfDischarge: string | null;
  dateOfHospitalization: string | null;
  dateOfNextVisit: string | null;
  hospitalizationPrismFileIds: (string | null)[] | null;
  source: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords {
  __typename: "PrismMedicalRecordsResult";
  labTests: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests | null)[] | null;
  healthChecks: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks | null)[] | null;
  hospitalizations: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations | null)[] | null;
}

export interface getPatientPrismMedicalRecords {
  getPatientPrismMedicalRecords: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords | null;
}

export interface getPatientPrismMedicalRecordsVariables {
  patientId: string;
}
