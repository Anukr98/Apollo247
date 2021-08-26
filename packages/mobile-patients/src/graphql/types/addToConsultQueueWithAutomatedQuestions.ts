/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConsultQueueInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addToConsultQueueWithAutomatedQuestions
// ====================================================

export interface addToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions {
  __typename: "AddToConsultAutomatedQuestionsResult";
  totalJuniorDoctorsOnline: number | null;
  isJdAllowed: boolean | null;
  isJdAssigned: boolean | null;
}

export interface addToConsultQueueWithAutomatedQuestions {
  addToConsultQueueWithAutomatedQuestions: addToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions;
}

export interface addToConsultQueueWithAutomatedQuestionsVariables {
  ConsultQueueInput?: ConsultQueueInput | null;
}
