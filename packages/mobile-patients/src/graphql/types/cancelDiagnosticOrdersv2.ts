/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CancellationDiagnosticsInputv2 } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: cancelDiagnosticOrdersv2
// ====================================================

export interface cancelDiagnosticOrdersv2_cancelDiagnosticOrdersv2 {
  __typename: "CancellationDiagnosticsOrderResponsev2";
  status: boolean;
  message: string;
}

export interface cancelDiagnosticOrdersv2 {
  cancelDiagnosticOrdersv2: cancelDiagnosticOrdersv2_cancelDiagnosticOrdersv2 | null;
}

export interface cancelDiagnosticOrdersv2Variables {
  cancellationDiagnosticsInput?: CancellationDiagnosticsInputv2 | null;
}
