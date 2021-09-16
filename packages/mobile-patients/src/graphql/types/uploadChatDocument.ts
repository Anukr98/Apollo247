/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: uploadChatDocument
// ====================================================

export interface uploadChatDocument_uploadChatDocument {
  __typename: "UploadChatDocumentResult";
  filePath: string | null;
}

export interface uploadChatDocument {
  uploadChatDocument: uploadChatDocument_uploadChatDocument;
}

export interface uploadChatDocumentVariables {
  fileType?: string | null;
  base64FileInput?: string | null;
  appointmentId?: string | null;
}
