/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddPrescriptionRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientPrescriptionRecord
// ====================================================

export interface addPatientPrescriptionRecord_addPatientPrescriptionRecord {
  __typename: "AddPrescriptionRecordResult";
  status: boolean | null;
}

export interface addPatientPrescriptionRecord {
  addPatientPrescriptionRecord: addPatientPrescriptionRecord_addPatientPrescriptionRecord;
}

export interface addPatientPrescriptionRecordVariables {
  AddPrescriptionRecordInput?: AddPrescriptionRecordInput | null;
}
