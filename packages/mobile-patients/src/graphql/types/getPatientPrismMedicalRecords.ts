/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MedicalConditionIllnessTypes, HealthRestrictionNature, AllergySeverity } from "./globalTypes";

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
  content: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response {
  __typename: "LabResultsBaseResponse";
  id: string;
  labTestName: string;
  labTestSource: string;
  packageId: string | null;
  packageName: string | null;
  date: any;
  labTestRefferedBy: string | null;
  siteDisplayName: string | null;
  tag: string | null;
  consultId: string | null;
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
  content: string | null;
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

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response_billFiles {
  __typename: "MedicalBillFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response {
  __typename: "MedicalBillsBaseResult";
  id: string | null;
  bill_no: string | null;
  hospitalName: string | null;
  billDate: number | null;
  source: string | null;
  notes: string | null;
  fileUrl: string | null;
  billDateTime: any | null;
  billFiles: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response_billFiles | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills {
  __typename: "MedicalBillsResult";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response_insuranceFiles {
  __typename: "MedicalInsuranceFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response {
  __typename: "MedicalInsurancesBaseResult";
  id: string | null;
  insuranceCompany: string | null;
  policyNumber: string | null;
  startDate: number | null;
  endDate: number | null;
  startDateTime: any | null;
  endDateTime: any | null;
  source: string | null;
  fileUrl: string | null;
  notes: string | null;
  sumInsured: string | null;
  insuranceFiles: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response_insuranceFiles | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances {
  __typename: "MedicalInsurancesResult";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions_response_medicationFiles {
  __typename: "MedicationFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions_response {
  __typename: "MedicalConditionBaseResponse";
  id: string | null;
  medicalConditionName: string | null;
  doctorTreated: string | null;
  startDate: number | null;
  source: string | null;
  endDate: number | null;
  notes: string | null;
  illnessType: MedicalConditionIllnessTypes | null;
  fileUrl: string | null;
  startDateTime: any | null;
  endDateTime: any | null;
  medicationFiles: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions_response_medicationFiles | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions {
  __typename: "MedicalConditionDownloadResponse";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medications_response {
  __typename: "MedicationsBaseResult";
  id: string | null;
  medicineName: string | null;
  medicalCondition: string | null;
  doctorName: string | null;
  startDate: number | null;
  endDate: number | null;
  startDateTime: any | null;
  endDateTime: any | null;
  morning: boolean | null;
  noon: boolean | null;
  evening: boolean | null;
  notes: string | null;
  source: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medications {
  __typename: "MedicationsResult";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medications_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthRestrictions_response {
  __typename: "HealthRestrictionsBaseResult";
  id: string | null;
  startDate: number | null;
  endDate: number | null;
  startDateTime: any | null;
  endDateTime: any | null;
  restrictionName: string | null;
  suggestedByDoctor: string | null;
  nature: HealthRestrictionNature | null;
  source: string | null;
  notes: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthRestrictions {
  __typename: "HealthRestrictionsResult";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthRestrictions_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies_response_attachmentList {
  __typename: "AllergyFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies_response {
  __typename: "AllergiesBaseResult";
  id: string | null;
  startDate: number | null;
  endDate: number | null;
  fileUrl: string | null;
  startDateTime: any | null;
  endDateTime: any | null;
  allergyName: string | null;
  severity: AllergySeverity | null;
  reactionToAllergy: string | null;
  doctorTreated: string | null;
  notes: string | null;
  source: string | null;
  attachmentList: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies_response_attachmentList | null)[] | null;
}

export interface getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies {
  __typename: "AllergiesResult";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies_response | null)[] | null;
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
  medicalBills: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills | null;
  medicalInsurances: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances | null;
  medicalConditions: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions | null;
  medications: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medications | null;
  healthRestrictions: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthRestrictions | null;
  allergies: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies | null;
}

export interface getPatientPrismMedicalRecords {
  getPatientPrismMedicalRecords: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords | null;
}

export interface getPatientPrismMedicalRecordsVariables {
  patientId: string;
}
