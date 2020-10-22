/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UPLOAD_FILE_TYPES } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: uploadChatDocumentToPrism
// ====================================================

export interface uploadChatDocumentToPrism_uploadChatDocumentToPrism {
  __typename: "UploadPrismChatDocumentResult";
  status: boolean;
  fileId: string | null;
}

export interface uploadChatDocumentToPrism {
  uploadChatDocumentToPrism: uploadChatDocumentToPrism_uploadChatDocumentToPrism;
}

export interface uploadChatDocumentToPrismVariables {
  fileType: UPLOAD_FILE_TYPES;
  base64FileInput: string;
  appointmentId?: string | null;
  patientId: string;
}
