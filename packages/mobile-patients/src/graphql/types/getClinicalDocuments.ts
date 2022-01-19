/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getClinicalDocuments
// ====================================================

export interface getClinicalDocuments_getClinicalDocuments_response_fileInfoList {
  __typename: "fileInfoList";
  id: string | null;
  fileStatus: string | null;
  locationtype: string | null;
  file_location: string | null;
  fileName: string | null;
  mimeType: string | null;
  content: string | null;
  byteContent: string | null;
  file_Url: string | null;
}

export interface getClinicalDocuments_getClinicalDocuments_response {
  __typename: "ClinicalDocumentsBaseResponse";
  id: string | null;
  documentName: string | null;
  uhid: string | null;
  mobileNumber: string | null;
  uploadedVia: string | null;
  documentStatus: string | null;
  fileTypeId: string | null;
  createddate: string | null;
  lastmodifieddate: string | null;
  authToken: string | null;
  source: string | null;
  parentFolder: string | null;
  fileInfoList: (getClinicalDocuments_getClinicalDocuments_response_fileInfoList | null)[] | null;
}

export interface getClinicalDocuments_getClinicalDocuments {
  __typename: "ClinicalDocumentsResponse";
  response: (getClinicalDocuments_getClinicalDocuments_response | null)[] | null;
}

export interface getClinicalDocuments {
  getClinicalDocuments: getClinicalDocuments_getClinicalDocuments | null;
}

export interface getClinicalDocumentsVariables {
  uhid: string;
  mobileNumber: string;
}
