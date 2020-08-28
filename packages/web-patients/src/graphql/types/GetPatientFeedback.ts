/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientFeedback
// ====================================================

export interface GetPatientFeedback_getPatientFeedback_feedback {
  __typename: "GetPatientFeedback";
  rating: string | null;
}

export interface GetPatientFeedback_getPatientFeedback {
  __typename: "GetPatientFeedbackResult";
  feedback: (GetPatientFeedback_getPatientFeedback_feedback | null)[] | null;
}

export interface GetPatientFeedback {
  getPatientFeedback: GetPatientFeedback_getPatientFeedback;
}

export interface GetPatientFeedbackVariables {
  patientId?: string | null;
  transactionId?: string | null;
}
