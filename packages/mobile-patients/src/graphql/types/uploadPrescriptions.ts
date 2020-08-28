/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PrescriptionUploadRequest } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: uploadPrescriptions
// ====================================================

export interface uploadPrescriptions_uploadPrescriptions {
  __typename: "PrescriptionResponse";
  recordId: string | null;
  fileUrl: string | null;
}

export interface uploadPrescriptions {
  uploadPrescriptions: uploadPrescriptions_uploadPrescriptions | null;
}

export interface uploadPrescriptionsVariables {
  PrescriptionUploadRequest?: PrescriptionUploadRequest | null;
  uhid?: string | null;
}
