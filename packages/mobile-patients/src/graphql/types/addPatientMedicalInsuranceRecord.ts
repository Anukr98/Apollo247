/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddPatientMedicalInsuranceRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientMedicalInsuranceRecord
// ====================================================

export interface addPatientMedicalInsuranceRecord_addPatientMedicalInsuranceRecord {
  __typename: "AddPatientMedicalInsuranceRecordResult";
  status: boolean | null;
}

export interface addPatientMedicalInsuranceRecord {
  addPatientMedicalInsuranceRecord: addPatientMedicalInsuranceRecord_addPatientMedicalInsuranceRecord;
}

export interface addPatientMedicalInsuranceRecordVariables {
  addPatientMedicalInsuranceRecordInput?: AddPatientMedicalInsuranceRecordInput | null;
}
