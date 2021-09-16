/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: savePhleboFeedback
// ====================================================

export interface savePhleboFeedback_savePhleboFeedback {
  __typename: "SavePhleboFeedbackResponse";
  status: boolean | null;
}

export interface savePhleboFeedback {
  savePhleboFeedback: savePhleboFeedback_savePhleboFeedback | null;
}

export interface savePhleboFeedbackVariables {
  phleboRating: number;
  phleboFeedback?: string | null;
  diagnosticOrdersId: string;
  patientComments?: string | null;
}
