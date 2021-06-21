/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: diagnosticExotelCalling
// ====================================================

export interface diagnosticExotelCalling_diagnosticExotelCalling {
  __typename: "ExotelCallResponse";
  errorMessage: string | null;
  sid: string | null;
  success: boolean | null;
}

export interface diagnosticExotelCalling {
  diagnosticExotelCalling: diagnosticExotelCalling_diagnosticExotelCalling | null;
}

export interface diagnosticExotelCallingVariables {
  orderId: string;
}
