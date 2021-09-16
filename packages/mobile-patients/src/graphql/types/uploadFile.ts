/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: uploadFile
// ====================================================

export interface uploadFile_uploadFile {
  __typename: "UploadFileResult";
  filePath: string | null;
}

export interface uploadFile {
  uploadFile: uploadFile_uploadFile;
}

export interface uploadFileVariables {
  fileType?: string | null;
  base64FileInput?: string | null;
}
