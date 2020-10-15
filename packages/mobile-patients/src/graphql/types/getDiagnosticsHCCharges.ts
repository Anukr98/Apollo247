/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticsHCCharges
// ====================================================

export interface getDiagnosticsHCCharges_getDiagnosticsHCCharges {
  __typename: "GetDiagnosticsHCCharges";
  charges: number | null;
}

export interface getDiagnosticsHCCharges {
  getDiagnosticsHCCharges: getDiagnosticsHCCharges_getDiagnosticsHCCharges;
}

export interface getDiagnosticsHCChargesVariables {
  itemIDs: (number | null)[];
  totalCharges: number;
  slotID: string;
  pincode: number;
}
