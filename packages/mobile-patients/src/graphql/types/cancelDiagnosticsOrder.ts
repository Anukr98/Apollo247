/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CancellationDiagnosticsInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: cancelDiagnosticsOrder
// ====================================================

export interface cancelDiagnosticsOrder_cancelDiagnosticsOrder {
  __typename: "CancellationDiagnosticsOrderResponse";
  status: string;
  message: string;
}

export interface cancelDiagnosticsOrder {
  cancelDiagnosticsOrder: cancelDiagnosticsOrder_cancelDiagnosticsOrder | null;
}

export interface cancelDiagnosticsOrderVariables {
  cancellationDiagnosticsInput?: CancellationDiagnosticsInput | null;
}
