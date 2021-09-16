/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientFeedbackInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPatientFeedback
// ====================================================

export interface addPatientFeedback_addPatientFeedback {
  __typename: "AddPatientFeedbackResult";
  status: boolean | null;
}

export interface addPatientFeedback {
  addPatientFeedback: addPatientFeedback_addPatientFeedback;
}

export interface addPatientFeedbackVariables {
  patientFeedbackInput?: PatientFeedbackInput | null;
}
