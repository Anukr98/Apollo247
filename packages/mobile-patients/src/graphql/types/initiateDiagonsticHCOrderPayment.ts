/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DiagnosticInitiateOrderPayment } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: initiateDiagonsticHCOrderPayment
// ====================================================

export interface initiateDiagonsticHCOrderPayment_initiateDiagonsticHCOrderPayment {
  __typename: "initiateDiagonsticHCOrderPaymentResult";
  status: boolean | null;
}

export interface initiateDiagonsticHCOrderPayment {
  initiateDiagonsticHCOrderPayment: initiateDiagonsticHCOrderPayment_initiateDiagonsticHCOrderPayment;
}

export interface initiateDiagonsticHCOrderPaymentVariables {
  diagnosticInitiateOrderPaymentInput: DiagnosticInitiateOrderPayment;
}
