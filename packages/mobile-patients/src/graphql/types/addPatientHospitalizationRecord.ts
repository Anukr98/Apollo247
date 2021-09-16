/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddHospitalizationRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientHospitalizationRecord
// ====================================================

export interface addPatientHospitalizationRecord_addPatientHospitalizationRecord {
  __typename: "AddHospitalizationRecordResult";
  status: boolean | null;
}

export interface addPatientHospitalizationRecord {
  addPatientHospitalizationRecord: addPatientHospitalizationRecord_addPatientHospitalizationRecord;
}

export interface addPatientHospitalizationRecordVariables {
  AddHospitalizationRecordInput?: AddHospitalizationRecordInput | null;
}
