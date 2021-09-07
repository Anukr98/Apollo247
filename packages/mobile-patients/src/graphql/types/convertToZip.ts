/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: convertToZip
// ====================================================

export interface convertToZip_convertToZip {
  __typename: "ConvertToZipResponse";
  zipUrl: string | null;
}

export interface convertToZip {
  convertToZip: convertToZip_convertToZip;
}

export interface convertToZipVariables {
  fileUrls: (string | null)[];
  uhid: string;
}
