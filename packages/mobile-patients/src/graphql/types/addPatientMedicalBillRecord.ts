/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddPatientMedicalBillRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientMedicalBillRecord
// ====================================================

export interface addPatientMedicalBillRecord_addPatientMedicalBillRecord {
  __typename: "AddPatientMedicalBillRecordResult";
  status: boolean | null;
}

export interface addPatientMedicalBillRecord {
  addPatientMedicalBillRecord: addPatientMedicalBillRecord_addPatientMedicalBillRecord;
}

export interface addPatientMedicalBillRecordVariables {
  addPatientMedicalBillRecordInput?: AddPatientMedicalBillRecordInput | null;
}
