/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SaveAppointmentCallFeedbackInput, CALL_FEEDBACK_RESPONSES_TYPES } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveAppointmentCallFeedback
// ====================================================

export interface saveAppointmentCallFeedback_saveAppointmentCallFeedback {
  __typename: "AppointmentCallFeedback";
  id: string;
  appointmentCallDetailsId: string;
  ratingValue: number;
  feedbackResponseType: CALL_FEEDBACK_RESPONSES_TYPES | null;
  feedbackResponses: string | null;
}

export interface saveAppointmentCallFeedback {
  saveAppointmentCallFeedback: saveAppointmentCallFeedback_saveAppointmentCallFeedback;
}

export interface saveAppointmentCallFeedbackVariables {
  saveAppointmentCallFeedback?: SaveAppointmentCallFeedbackInput | null;
}
