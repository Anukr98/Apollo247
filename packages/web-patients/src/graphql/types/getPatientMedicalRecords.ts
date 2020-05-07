/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MedicalRecordType, MedicalTestUnit } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientMedicalRecords
// ====================================================

export interface getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords_medicalRecordParameters {
  __typename: "MedicalRecordParameters";
  id: string;
  parameterName: string;
  unit: MedicalTestUnit | null;
  result: number | null;
  minimum: number | null;
  maximum: number | null;
}

export interface getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords {
  __typename: "MedicalRecords";
  id: string;
  testName: string;
  testDate: any | null;
  recordType: MedicalRecordType | null;
  referringDoctor: string | null;
  observations: string | null;
  additionalNotes: string | null;
  sourceName: string | null;
  documentURLs: string | null;
  prismFileIds: string | null;
  issuingDoctor: string | null;
  location: string | null;
  medicalRecordParameters: (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords_medicalRecordParameters | null)[] | null;
}

export interface getPatientMedicalRecords_getPatientMedicalRecords {
  __typename: "MedicalRecordsResult";
  medicalRecords: (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords | null)[] | null;
}

export interface getPatientMedicalRecords {
  getPatientMedicalRecords: getPatientMedicalRecords_getPatientMedicalRecords | null;
}

export interface getPatientMedicalRecordsVariables {
  patientId: string;
}
