/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LabResultsUploadRequest } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: uploadLabResults
// ====================================================

export interface uploadLabResults_uploadLabResults {
  __typename: "LabResultsResponse";
  recordId: string | null;
  fileUrl: string | null;
}

export interface uploadLabResults {
  uploadLabResults: uploadLabResults_uploadLabResults | null;
}

export interface uploadLabResultsVariables {
  LabResultsUploadRequest?: LabResultsUploadRequest | null;
  uhid?: string | null;
}
