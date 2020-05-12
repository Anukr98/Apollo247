/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UploadChatDocument
// ====================================================

export interface UploadChatDocument_uploadChatDocument {
  __typename: "UploadChatDocumentResult";
  filePath: string | null;
}

export interface UploadChatDocument {
  uploadChatDocument: UploadChatDocument_uploadChatDocument;
}

export interface UploadChatDocumentVariables {
  fileType?: string | null;
  base64FileInput?: string | null;
  appointmentId?: string | null;
}
