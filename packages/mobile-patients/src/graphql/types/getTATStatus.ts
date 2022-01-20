/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GetTATStatusForDiagnosticOrderInput, KB_CONTENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getTATStatus
// ====================================================

export interface getTATStatus_getTATStatusForDiagnosticOrder_KB {
  __typename: "KBType";
  contentType:  KB_CONTENT_TYPE | null;
  content: string | null;
  categories: (string | null)[] | null;
}

export interface getTATStatus_getTATStatusForDiagnosticOrder {
  __typename: "GetTATStatusForDiagnosticOrderResult";
  TATBreached: boolean | null;
  KB: getTATStatus_getTATStatusForDiagnosticOrder_KB | null;
}

export interface getTATStatus {
  getTATStatusForDiagnosticOrder: getTATStatus_getTATStatusForDiagnosticOrder | null;
}

export interface getTATStatusVariables {
  GetTATStatusForDiagnosticOrderInput?: GetTATStatusForDiagnosticOrderInput | null;
}