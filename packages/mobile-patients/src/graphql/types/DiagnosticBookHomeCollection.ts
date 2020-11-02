/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DiagnosticBookHomeCollectionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: DiagnosticBookHomeCollection
// ====================================================

export interface DiagnosticBookHomeCollection_DiagnosticBookHomeCollection {
  __typename: "SaveDiagnosticOrderResult";
  errorCode: number | null;
  errorMessage: string | null;
  orderId: string | null;
  displayId: string | null;
}

export interface DiagnosticBookHomeCollection {
  DiagnosticBookHomeCollection: DiagnosticBookHomeCollection_DiagnosticBookHomeCollection;
}

export interface DiagnosticBookHomeCollectionVariables {
  diagnosticOrderInput?: DiagnosticBookHomeCollectionInput | null;
}
