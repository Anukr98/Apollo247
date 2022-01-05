/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddClinicalDocumentInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveClinicalDocuments
// ====================================================

export interface saveClinicalDocuments_saveClinicalDocuments {
  __typename: "AddClinicalDocumentResult";
  status: boolean | null;
}

export interface saveClinicalDocuments {
  saveClinicalDocuments: saveClinicalDocuments_saveClinicalDocuments;
}

export interface saveClinicalDocumentsVariables {
  addClinicalDocumentInput?: AddClinicalDocumentInput | null;
}
