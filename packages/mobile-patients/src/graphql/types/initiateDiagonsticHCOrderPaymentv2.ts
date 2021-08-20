/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DiagnosticInitiateOrderPaymentv2 } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: initiateDiagonsticHCOrderPaymentv2
// ====================================================

export interface initiateDiagonsticHCOrderPaymentv2_initiateDiagonsticHCOrderPaymentv2 {
  __typename: "initiateDiagonsticHCOrderPaymentResult";
  status: boolean | null;
}

export interface initiateDiagonsticHCOrderPaymentv2 {
  initiateDiagonsticHCOrderPaymentv2: initiateDiagonsticHCOrderPaymentv2_initiateDiagonsticHCOrderPaymentv2;
}

export interface initiateDiagonsticHCOrderPaymentv2Variables {
  diagnosticInitiateOrderPaymentInput: DiagnosticInitiateOrderPaymentv2;
}
