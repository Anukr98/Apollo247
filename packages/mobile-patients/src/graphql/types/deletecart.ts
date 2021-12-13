/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deletecart
// ====================================================

export interface deletecart_deletecart {
  __typename: "DeleteCartResponse";
  success: boolean | null;
}

export interface deletecart {
  deletecart: deletecart_deletecart;
}

export interface deletecartVariables {
  patientId: string;
  paymentSuccess: boolean;
  paymentOrderId: string;
}
