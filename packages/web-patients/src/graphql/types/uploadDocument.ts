/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UploadDocumentInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: uploadDocument
// ====================================================

export interface uploadDocument_uploadDocument {
  __typename: "UploadPrismDocumentResult";
  status: boolean;
  fileId: string | null;
  filePath: string | null;
}

export interface uploadDocument {
  uploadDocument: uploadDocument_uploadDocument;
}

export interface uploadDocumentVariables {
  UploadDocumentInput?: UploadDocumentInput | null;
}
