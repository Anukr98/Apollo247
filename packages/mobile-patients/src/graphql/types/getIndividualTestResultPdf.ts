/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getIndividualTestResultPdf
// ====================================================

export interface getIndividualTestResultPdf_getLabResultpdf {
  __typename: "GetLabResultpdfResponse";
  url: string;
}

export interface getIndividualTestResultPdf {
  getLabResultpdf: getIndividualTestResultPdf_getLabResultpdf | null;
}

export interface getIndividualTestResultPdfVariables {
  patientId: string;
  recordId: string;
  sequence: string;
}
