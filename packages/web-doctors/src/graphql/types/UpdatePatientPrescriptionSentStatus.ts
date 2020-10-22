/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Vitals } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePatientPrescriptionSentStatus
// ====================================================

export interface UpdatePatientPrescriptionSentStatus_updatePatientPrescriptionSentStatus {
  __typename: "PatientPrescriptionSentResponse";
  success: boolean | null;
  blobName: string | null;
  prescriptionGeneratedDate: any | null;
}

export interface UpdatePatientPrescriptionSentStatus {
  updatePatientPrescriptionSentStatus: UpdatePatientPrescriptionSentStatus_updatePatientPrescriptionSentStatus | null;
}

export interface UpdatePatientPrescriptionSentStatusVariables {
  caseSheetId: string;
  sentToPatient: boolean;
  vitals?: Vitals | null;
}
