/* tslint:disable */
/* eslint-disable */
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

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response_labTestResults {
  __typename: "LabTestFileParameters";
  parameterName: string | null;
  unit: string | null;
  result: string | null;
  range: string | null;
  outOfRange: boolean | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response_testResultFiles {
  __typename: "PrecriptionFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response {
  __typename: "LabResultsBaseResponse";
  id: string;
  labTestName: string;
  labTestSource: string;
  date: any;
  labTestRefferedBy: string | null;
  additionalNotes: string | null;
  observation: string | null;
  labTestResults: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response_labTestResults | null)[] | null;
  fileUrl: string;
  testResultFiles: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response_testResultFiles | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults {
  __typename: "LabResultsDownloadResponse";
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response | null)[] | null;
  errorCode: number;
  errorMsg: string | null;
  errorType: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response_prescriptionFiles {
  __typename: "PrecriptionFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response {
  __typename: "PrescriptionsBaseResponse";
  id: string;
  prescriptionName: string;
  date: any;
  prescribedBy: string | null;
  notes: string | null;
  prescriptionSource: string | null;
  source: string;
  fileUrl: string;
  prescriptionFiles: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response_prescriptionFiles | null)[] | null;
  hospital_name: string | null;
  hospitalId: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions {
  __typename: "PrescriptionDownloadResponse";
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response | null)[] | null;
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response_healthCheckFiles {
  __typename: "HealthCheckFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
  byteContent: string | null;
  dateCreated: number | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response {
  __typename: "HealthChecksBaseResponse";
  authToken: string | null;
  userId: string | null;
  id: string;
  fileUrl: string;
  date: any;
  healthCheckName: string;
  healthCheckDate: number | null;
  healthCheckSummary: string | null;
  healthCheckFiles: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response_healthCheckFiles | null)[] | null;
  source: string | null;
  healthCheckType: string | null;
  followupDate: number | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew {
  __typename: "HealthChecksDownloadResponse";
  errorCode: number;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response_hospitalizationFiles {
  __typename: "HospitalizationFilesParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
  byteContent: string | null;
  dateCreated: number | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response {
  __typename: "DischargeSummaryBaseResponse";
  authToken: string | null;
  userId: string | null;
  id: string | null;
  fileUrl: string;
  date: any;
  hospitalizationDate: any | null;
  dateOfHospitalization: number | null;
  hospitalName: string | null;
  doctorName: string | null;
  reasonForAdmission: string | null;
  diagnosisNotes: string | null;
  dateOfDischarge: number | null;
  dischargeSummary: string | null;
  doctorInstruction: string | null;
  dateOfNextVisit: number | null;
  hospitalizationFiles: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response_hospitalizationFiles | null)[] | null;
  source: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew {
  __typename: "DischargeSummaryDownloadResponse";
  errorCode: number;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords {
  __typename: "PrismMedicalRecordsResult";
  labTests: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests | null)[] | null;
  healthChecks: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks | null)[] | null;
  hospitalizations: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations | null)[] | null;
  labResults: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults | null;
  prescriptions: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions | null;
  healthChecksNew: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew | null;
  hospitalizationsNew: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew | null;
}

export interface getPatientPrismMedicalRecords {
  getPatientPrismMedicalRecords: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords | null;
}

export interface getPatientPrismMedicalRecordsVariables {
  patientId: string;
}
