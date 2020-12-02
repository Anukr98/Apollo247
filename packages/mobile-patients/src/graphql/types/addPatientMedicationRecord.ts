/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddPatientMedicationRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientMedicationRecord
// ====================================================

export interface addPatientMedicationRecord_addPatientMedicationRecord {
  __typename: "AddPatientMedicationRecordResult";
  status: boolean | null;
}

export interface addPatientMedicationRecord {
  addPatientMedicationRecord: addPatientMedicationRecord_addPatientMedicationRecord;
}

export interface addPatientMedicationRecordVariables {
  addPatientMedicationRecordInput?: AddPatientMedicationRecordInput | null;
}
