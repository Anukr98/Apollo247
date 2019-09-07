/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { AddMedicalRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientMedicalRecord
// ====================================================

export interface addPatientMedicalRecord_addPatientMedicalRecord {
  __typename: "AddMedicalRecordResult";
  status: boolean | null;
}

export interface addPatientMedicalRecord {
  addPatientMedicalRecord: addPatientMedicalRecord_addPatientMedicalRecord;
}

export interface addPatientMedicalRecordVariables {
  AddMedicalRecordInput?: AddMedicalRecordInput | null;
}
