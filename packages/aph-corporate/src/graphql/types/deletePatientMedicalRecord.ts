/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deletePatientMedicalRecord
// ====================================================

export interface deletePatientMedicalRecord_deletePatientMedicalRecord {
  __typename: "DeleteMedicalRecordResult";
  status: boolean | null;
}

export interface deletePatientMedicalRecord {
  deletePatientMedicalRecord: deletePatientMedicalRecord_deletePatientMedicalRecord;
}

export interface deletePatientMedicalRecordVariables {
  recordId: string;
}
