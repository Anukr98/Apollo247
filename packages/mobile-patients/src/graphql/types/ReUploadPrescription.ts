/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PrescriptionReUploadInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ReUploadPrescription
// ====================================================

export interface ReUploadPrescription_reUploadPrescription {
  __typename: "ReUploadPrescriptionResponse";
  success: boolean | null;
}

export interface ReUploadPrescription {
  reUploadPrescription: ReUploadPrescription_reUploadPrescription | null;
}

export interface ReUploadPrescriptionVariables {
  prescriptionInput?: PrescriptionReUploadInput | null;
}
