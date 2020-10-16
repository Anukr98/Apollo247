/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { AddHealthCheckRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientHealthCheckRecord
// ====================================================

export interface addPatientHealthCheckRecord_addPatientHealthCheckRecord {
  __typename: "AddHealthCheckRecordResult";
  status: boolean | null;
}

export interface addPatientHealthCheckRecord {
  addPatientHealthCheckRecord: addPatientHealthCheckRecord_addPatientHealthCheckRecord;
}

export interface addPatientHealthCheckRecordVariables {
  AddHealthCheckRecordInput?: AddHealthCheckRecordInput | null;
}
