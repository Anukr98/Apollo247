/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MediaPrescriptionUploadRequest } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: uploadMediaDocumentV2
// ====================================================

export interface uploadMediaDocumentV2_uploadMediaDocumentV2 {
  __typename: "uploadFileResponse";
  fileUrl: string | null;
}

export interface uploadMediaDocumentV2 {
  uploadMediaDocumentV2: (uploadMediaDocumentV2_uploadMediaDocumentV2 | null)[] | null;
}

export interface uploadMediaDocumentV2Variables {
  MediaPrescriptionUploadRequest?: MediaPrescriptionUploadRequest | null;
  uhid: string;
  appointmentId: string;
}
