/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: addChatDocument
// ====================================================

export interface addChatDocument_addChatDocument {
  __typename: "UploadedDocumentDetails";
  id: string | null;
  documentPath: string | null;
  prismFileId: string | null;
}

export interface addChatDocument {
  addChatDocument: addChatDocument_addChatDocument | null;
}

export interface addChatDocumentVariables {
  appointmentId: string;
  documentPath?: string | null;
  prismFileId?: string | null;
  fileName?: string | null;
}
