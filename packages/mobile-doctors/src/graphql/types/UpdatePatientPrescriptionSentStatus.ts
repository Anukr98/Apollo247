/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdatePatientPrescriptionSentStatus
// ====================================================

export interface UpdatePatientPrescriptionSentStatus_updatePatientPrescriptionSentStatus {
  __typename: "PatientPrescriptionSentResponse";
  success: boolean | null;
  blobName: string | null;
}

export interface UpdatePatientPrescriptionSentStatus {
  updatePatientPrescriptionSentStatus: UpdatePatientPrescriptionSentStatus_updatePatientPrescriptionSentStatus | null;
}

export interface UpdatePatientPrescriptionSentStatusVariables {
  caseSheetId: string;
  sentToPatient: boolean;
}
