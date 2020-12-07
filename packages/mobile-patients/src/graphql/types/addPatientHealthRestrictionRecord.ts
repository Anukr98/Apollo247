/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddPatientHealthRestrictionRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientHealthRestrictionRecord
// ====================================================

export interface addPatientHealthRestrictionRecord_addPatientHealthRestrictionRecord {
  __typename: "AddPatientHealthRestrictionRecordResult";
  status: boolean | null;
}

export interface addPatientHealthRestrictionRecord {
  addPatientHealthRestrictionRecord: addPatientHealthRestrictionRecord_addPatientHealthRestrictionRecord;
}

export interface addPatientHealthRestrictionRecordVariables {
  addPatientHealthRestrictionRecordInput?: AddPatientHealthRestrictionRecordInput | null;
}
