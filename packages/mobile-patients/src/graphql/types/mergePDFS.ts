/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: mergePDFS
// ====================================================

export interface mergePDFS_mergePDFS {
  __typename: "mergePDFSResponse";
  mergepdfUrl: string | null;
}

export interface mergePDFS {
  mergePDFS: mergePDFS_mergePDFS;
}

export interface mergePDFSVariables {
  uhid: string;
  fileUrls: (string | null)[];
}
