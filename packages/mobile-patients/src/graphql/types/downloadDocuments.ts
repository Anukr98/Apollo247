/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DownloadDocumentsInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: downloadDocuments
// ====================================================

export interface downloadDocuments_downloadDocuments {
  __typename: "DownloadDocumentsResult";
  downloadPaths: string[] | null;
}

export interface downloadDocuments {
  downloadDocuments: downloadDocuments_downloadDocuments;
}

export interface downloadDocumentsVariables {
  downloadDocumentsInput: DownloadDocumentsInput;
}
