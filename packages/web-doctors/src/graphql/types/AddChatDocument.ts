/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddChatDocument
// ====================================================

export interface AddChatDocument_addChatDocument {
  __typename: "UploadedDocumentDetails";
  id: string | null;
  filePath: string | null;
}

export interface AddChatDocument {
  addChatDocument: AddChatDocument_addChatDocument | null;
}

export interface AddChatDocumentVariables {
  appointmentId: string;
  documentPath: string;
}
