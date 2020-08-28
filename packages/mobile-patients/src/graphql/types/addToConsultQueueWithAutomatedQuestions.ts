/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConsultQueueInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addToConsultQueueWithAutomatedQuestions
// ====================================================

export interface addToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions_juniorDoctorsList {
  __typename: "JuniorDoctorsList";
  juniorDoctorId: string;
  doctorName: string;
}

export interface addToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions {
  __typename: "AddToConsultQueueResult";
  id: number;
  doctorId: string;
  totalJuniorDoctorsOnline: number;
  juniorDoctorsList: (addToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions_juniorDoctorsList | null)[];
  totalJuniorDoctors: number;
  isJdAllowed: boolean | null;
}

export interface addToConsultQueueWithAutomatedQuestions {
  addToConsultQueueWithAutomatedQuestions: addToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions;
}

export interface addToConsultQueueWithAutomatedQuestionsVariables {
  ConsultQueueInput?: ConsultQueueInput | null;
}
