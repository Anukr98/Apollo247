/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getIndividualTestResultPdf
// ====================================================

export interface getIndividualTestResultPdf_getIndividualTestResultPdf {
  __typename: "GetLabResultpdfResponse";
  url: string;
}

export interface getIndividualTestResultPdf {
  getIndividualTestResultPdf: getIndividualTestResultPdf_getIndividualTestResultPdf | null;
}

export interface getIndividualTestResultPdfVariables {
  patientId: string;
  recordId: string;
  sequence: string;
}
