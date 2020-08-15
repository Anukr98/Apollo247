/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MediaPrescriptionUploadRequest } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: uploadMediaDocument
// ====================================================

export interface uploadMediaDocument_uploadMediaDocument {
  __typename: "MediaPrescriptionResponse";
  recordId: string | null;
  fileUrl: string | null;
}

export interface uploadMediaDocument {
  uploadMediaDocument: uploadMediaDocument_uploadMediaDocument | null;
}

export interface uploadMediaDocumentVariables {
  MediaPrescriptionUploadRequest?: MediaPrescriptionUploadRequest | null;
  uhid: string;
  appointmentId: string;
}
