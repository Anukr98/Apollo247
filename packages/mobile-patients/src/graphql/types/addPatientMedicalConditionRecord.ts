/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddMedicalConditionRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientMedicalConditionRecord
// ====================================================

export interface addPatientMedicalConditionRecord_addPatientMedicalConditionRecord {
  __typename: "AddMedicalConditionRecordResult";
  status: boolean | null;
}

export interface addPatientMedicalConditionRecord {
  addPatientMedicalConditionRecord: addPatientMedicalConditionRecord_addPatientMedicalConditionRecord;
}

export interface addPatientMedicalConditionRecordVariables {
  addMedicalConditionRecordInput?: AddMedicalConditionRecordInput | null;
}
