/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MedicalRecordType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: deletePatientPrismMedicalRecord
// ====================================================

export interface deletePatientPrismMedicalRecord_deletePatientPrismMedicalRecord {
  __typename: "DeletePatientPrismMedicalRecordResult";
  status: boolean | null;
}

export interface deletePatientPrismMedicalRecord {
  deletePatientPrismMedicalRecord: deletePatientPrismMedicalRecord_deletePatientPrismMedicalRecord;
}

export interface deletePatientPrismMedicalRecordVariables {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
}
