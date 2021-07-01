/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CowinRegistrationInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: cowinRegistration
// ====================================================

export interface cowinRegistration_cowinRegistration_response {
  __typename: "CowinRegistration";
  txnId: string | null;
  beneficiary_reference_id: string | null;
  errorCode: string | null;
  error: string | null;
}

export interface cowinRegistration_cowinRegistration {
  __typename: "CowinRegistrationResponse";
  code: number;
  response: cowinRegistration_cowinRegistration_response | null;
  message: string | null;
}

export interface cowinRegistration {
  cowinRegistration: cowinRegistration_cowinRegistration;
}

export interface cowinRegistrationVariables {
  cowinRegistration: CowinRegistrationInput;
}
