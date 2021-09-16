/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddAllergyRecordInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientAllergyRecord
// ====================================================

export interface addPatientAllergyRecord_addPatientAllergyRecord {
  __typename: "AddAllergyRecordResult";
  status: boolean | null;
}

export interface addPatientAllergyRecord {
  addPatientAllergyRecord: addPatientAllergyRecord_addPatientAllergyRecord;
}

export interface addPatientAllergyRecordVariables {
  addAllergyRecordInput?: AddAllergyRecordInput | null;
}
