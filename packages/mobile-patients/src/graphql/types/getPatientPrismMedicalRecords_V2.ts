/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  MedicalRecordType,
  MedicalConditionIllnessTypes,
  HealthRestrictionNature,
  AllergySeverity,
} from './globalTypes';

// ====================================================
// GraphQL query operation: getPatientPrismMedicalRecords_V2
// ====================================================

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response_labTestResults {
  __typename: 'LabTestFileParameters';
  parameterName: string | null;
  unit: string | null;
  result: string | null;
  range: string | null;
  outOfRange: boolean | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response_testResultFiles {
  __typename: 'PrecriptionFileParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response {
  __typename: 'LabResultsBaseResponse';
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
  identifier: string | null;
  additionalNotes: string | null;
  observation: string | null;
  labTestResults:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response_labTestResults | null)[]
    | null;
  fileUrl: string;
  testResultFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response_testResultFiles | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults {
  __typename: 'LabResultsDownloadResponse';
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response | null)[]
    | null;
  errorCode: number;
  errorMsg: string | null;
  errorType: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response_prescriptionFiles {
  __typename: 'PrecriptionFileParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response {
  __typename: 'PrescriptionsBaseResponse';
  id: string;
  prescriptionName: string;
  date: any;
  prescribedBy: string | null;
  notes: string | null;
  prescriptionSource: string | null;
  siteDisplayName: string | null;
  source: string;
  fileUrl: string;
  prescriptionFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response_prescriptionFiles | null)[]
    | null;
  hospital_name: string | null;
  hospitalId: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions {
  __typename: 'PrescriptionDownloadResponse';
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response | null)[]
    | null;
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks_response_healthCheckFiles {
  __typename: 'HealthCheckFileParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks_response {
  __typename: 'HealthChecksBaseResponse';
  authToken: string | null;
  userId: string | null;
  id: string;
  fileUrl: string;
  date: any;
  healthCheckName: string;
  healthCheckDate: number | null;
  siteDisplayName: string | null;
  healthCheckSummary: string | null;
  healthCheckFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks_response_healthCheckFiles | null)[]
    | null;
  source: string | null;
  healthCheckType: string | null;
  followupDate: number | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks {
  __typename: 'HealthChecksDownloadResponse';
  errorCode: number;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_hospitalizations_response_hospitalizationFiles {
  __typename: 'HospitalizationFilesParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_hospitalizations_response {
  __typename: 'DischargeSummaryBaseResponse';
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
  siteDisplayName: string | null;
  diagnosisNotes: string | null;
  dateOfDischarge: number | null;
  dischargeSummary: string | null;
  doctorInstruction: string | null;
  dateOfNextVisit: number | null;
  hospitalizationFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_hospitalizations_response_hospitalizationFiles | null)[]
    | null;
  source: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_hospitalizations {
  __typename: 'DischargeSummaryDownloadResponse';
  errorCode: number;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_hospitalizations_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalBills_response_billFiles {
  __typename: 'MedicalBillFileParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalBills_response {
  __typename: 'MedicalBillsBaseResult';
  id: string | null;
  bill_no: string | null;
  hospitalName: string | null;
  billDate: number | null;
  source: string | null;
  siteDisplayName: string | null;
  notes: string | null;
  fileUrl: string | null;
  billDateTime: any | null;
  billFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalBills_response_billFiles | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalBills {
  __typename: 'MedicalBillsResult';
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalBills_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalInsurances_response_insuranceFiles {
  __typename: 'MedicalInsuranceFileParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalInsurances_response {
  __typename: 'MedicalInsurancesBaseResult';
  id: string | null;
  insuranceCompany: string | null;
  policyNumber: string | null;
  startDate: number | null;
  endDate: number | null;
  startDateTime: any | null;
  endDateTime: any | null;
  source: string | null;
  siteDisplayName: string | null;
  fileUrl: string | null;
  notes: string | null;
  sumInsured: string | null;
  insuranceFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalInsurances_response_insuranceFiles | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalInsurances {
  __typename: 'MedicalInsurancesResult';
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalInsurances_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalConditions_response_medicationFiles {
  __typename: 'MedicationFileParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalConditions_response {
  __typename: 'MedicalConditionBaseResponse';
  id: string | null;
  medicalConditionName: string | null;
  doctorTreated: string | null;
  startDate: number | null;
  source: string | null;
  endDate: number | null;
  notes: string | null;
  illnessType: MedicalConditionIllnessTypes | null;
  fileUrl: string | null;
  siteDisplayName: string | null;
  startDateTime: any | null;
  endDateTime: any | null;
  medicationFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalConditions_response_medicationFiles | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalConditions {
  __typename: 'MedicalConditionDownloadResponse';
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalConditions_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medications_response {
  __typename: 'MedicationsBaseResult';
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
  siteDisplayName: string | null;
  evening: boolean | null;
  notes: string | null;
  source: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medications {
  __typename: 'MedicationsResult';
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medications_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthRestrictions_response {
  __typename: 'HealthRestrictionsBaseResult';
  id: string | null;
  startDate: number | null;
  endDate: number | null;
  startDateTime: any | null;
  endDateTime: any | null;
  restrictionName: string | null;
  suggestedByDoctor: string | null;
  nature: HealthRestrictionNature | null;
  siteDisplayName: string | null;
  source: string | null;
  notes: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthRestrictions {
  __typename: 'HealthRestrictionsResult';
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthRestrictions_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_allergies_response_attachmentList {
  __typename: 'AllergyFileParameters';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_allergies_response {
  __typename: 'AllergiesBaseResult';
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
  siteDisplayName: string | null;
  source: string | null;
  attachmentList:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_allergies_response_attachmentList | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_allergies {
  __typename: 'AllergiesResult';
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_allergies_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_familyHistory_response_familyHistoryFiles {
  __typename: 'FamilyHistoryFiles';
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  index: string | null;
  file_Url: string | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_familyHistory_response {
  __typename: 'FamilyHistoryResponse';
  id: string | null;
  diseaseName: string | null;
  authToken: string | null;
  source: string | null;
  fileUrl: string | null;
  familyMember: string | null;
  notes: string | null;
  siteDisplayName: string | null;
  recordDateTime: any | null;
  age: number | null;
  familyHistoryFiles:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_familyHistory_response_familyHistoryFiles | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_familyHistory {
  __typename: 'PrismFamilyHistoryResponse';
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response:
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_familyHistory_response | null)[]
    | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations_response_reactions {
  __typename: "ImmunizationReactions";
  type: string | null;
  from: any | null;
  to: any | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations_response_immunizationFiles {
  __typename: "ImmunizationFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
  byteContent: string | null;
  dateCreated: number | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations_response {
  __typename: "ImmunizationsBaseResult";
  id: string | null;
  immunizationName: string | null;
  dateAdministered: any | null;
  followUpDate: any | null;
  regstrationId: string | null;
  dateOfImmunization: string | null;
  dueDate: any | null;
  fileUrl: string | null;
  doctorName: string | null;
  manufacturer: string | null;
  batchno: string | null;
  vaccineName: string | null;
  potency: string | null;
  hospitalName: string | null;
  vaccine_location: string | null;
  notes: string | null;
  source: string | null;
  reactions: (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations_response_reactions | null)[] | null;
  immunizationFiles: (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations_response_immunizationFiles | null)[] | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations {
  __typename: "ImmunizationsResult";
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
  response: (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations_response | null)[] | null;
}

export interface getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2 {
  __typename: 'PrismMedicalRecordsResult_V2';
  labResults: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults | null;
  prescriptions: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions | null;
  healthChecks: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks | null;
  hospitalizations: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_hospitalizations | null;
  medicalBills: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalBills | null;
  medicalInsurances: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalInsurances | null;
  medicalConditions: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medicalConditions | null;
  medications: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_medications | null;
  healthRestrictions: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthRestrictions | null;
  allergies: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_allergies | null;
  familyHistory: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_familyHistory | null;
  immunizations: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_immunizations | null;
}

export interface getPatientPrismMedicalRecords_V2 {
  getPatientPrismMedicalRecords_V2: getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2 | null;
}

export interface getPatientPrismMedicalRecords_V2Variables {
  patientId: string;
  records?: (MedicalRecordType | null)[] | null;
}
