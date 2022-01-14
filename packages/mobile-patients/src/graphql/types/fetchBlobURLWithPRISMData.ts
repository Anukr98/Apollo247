/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: fetchBlobURLWithPRISMData
// ====================================================

export interface fetchBlobURLWithPRISMData_fetchBlobURLWithPRISMData {
  __typename: "Bloburl";
  blobUrl: string;
}

export interface fetchBlobURLWithPRISMData {
  fetchBlobURLWithPRISMData: fetchBlobURLWithPRISMData_fetchBlobURLWithPRISMData | null;
}

export interface fetchBlobURLWithPRISMDataVariables {
  patientId: string;
  fileUrl: string;
}
