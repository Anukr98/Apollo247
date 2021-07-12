/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddImmunizationRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientImmunizationRecord
// ====================================================

export interface addPatientImmunizationRecord_addPatientImmunizationRecord {
  __typename: "AddImmunizationRecordResult";
  status: boolean | null;
}

export interface addPatientImmunizationRecord {
  addPatientImmunizationRecord: addPatientImmunizationRecord_addPatientImmunizationRecord;
}

export interface addPatientImmunizationRecordVariables {
  addImmunizationRecordInput?: AddImmunizationRecordInput | null;
}
