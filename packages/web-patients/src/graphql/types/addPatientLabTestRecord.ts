/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddLabTestRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientLabTestRecord
// ====================================================

export interface addPatientLabTestRecord_addPatientLabTestRecord {
  __typename: "AddLabTestRecordResult";
  status: boolean | null;
}

export interface addPatientLabTestRecord {
  addPatientLabTestRecord: addPatientLabTestRecord_addPatientLabTestRecord;
}

export interface addPatientLabTestRecordVariables {
  AddLabTestRecordInput?: AddLabTestRecordInput | null;
}
