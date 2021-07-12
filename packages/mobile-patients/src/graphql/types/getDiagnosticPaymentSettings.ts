/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticPaymentSettings
// ====================================================

export interface getDiagnosticPaymentSettings_getDiagnosticPaymentSettings {
  __typename: "DiagnosticPaymentSettingsResponse";
  cod: boolean | null;
}

export interface getDiagnosticPaymentSettings {
  getDiagnosticPaymentSettings: getDiagnosticPaymentSettings_getDiagnosticPaymentSettings | null;
}

export interface getDiagnosticPaymentSettingsVariables {
  paymentOrderId: string;
}
