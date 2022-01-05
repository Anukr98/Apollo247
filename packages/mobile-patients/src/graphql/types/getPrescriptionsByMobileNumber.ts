/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MedicalRecordType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPrescriptionsByMobileNumber
// ====================================================

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report_response_labTestResults {
  __typename: "LabTestFileParameters";
  parameterName: string | null;
  unit: string | null;
  result: string | null;
  range: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report_response_testResultFiles {
  __typename: "PrecriptionFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  file_Url: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report_response {
  __typename: "LabResultsBaseResponse";
  id: string;
  labTestName: string;
  labTestSource: string;
  packageId: string | null;
  packageName: string | null;
  labTestDate: number;
  date: any;
  labTestRefferedBy: string | null;
  siteDisplayName: string | null;
  tag: string | null;
  consultId: string | null;
  identifier: string | null;
  additionalNotes: string | null;
  observation: string | null;
  labTestResults: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report_response_labTestResults | null)[] | null;
  fileUrl: string;
  testResultFiles: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report_response_testResultFiles | null)[] | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report {
  __typename: "LabResultsDownloadResponse";
  response: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report_response | null)[] | null;
  errorCode: number;
  errorMsg: string | null;
  errorType: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescription_response_prescriptionFiles {
  __typename: "PrecriptionFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
  file_Url: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescription_response {
  __typename: "PrescriptionsBaseResponse";
  id: string;
  prescriptionName: string | null;
  date: any;
  prescribedBy: string | null;
  notes: string | null;
  prescriptionSource: string | null;
  siteDisplayName: string | null;
  source: string;
  fileUrl: string;
  prescriptionFiles: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescription_response_prescriptionFiles | null)[] | null;
  hospital_name: string | null;
  hospitalId: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescription {
  __typename: "PrescriptionDownloadResponse";
  response: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescription_response | null)[] | null;
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber {
  __typename: "ProfilePrescriptionsResult";
  patientId: string | null;
  test_report: getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_test_report | null;
  prescription: getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescription | null;
}

export interface getPrescriptionsByMobileNumber {
  getPrescriptionsByMobileNumber: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber | null)[] | null;
}

export interface getPrescriptionsByMobileNumberVariables {
  MobileNumber: string;
  recordId: string;
  source: string;
  records: (MedicalRecordType | null)[];
}
