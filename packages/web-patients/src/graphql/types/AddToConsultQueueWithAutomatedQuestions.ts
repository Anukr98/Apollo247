/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConsultQueueInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AddToConsultQueueWithAutomatedQuestions
// ====================================================

export interface AddToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions_juniorDoctorsList {
  __typename: "JuniorDoctorsList";
  juniorDoctorId: string;
  doctorName: string;
}

export interface AddToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions {
  __typename: "AddToConsultQueueResult";
  id: number;
  doctorId: string;
  totalJuniorDoctorsOnline: number;
  juniorDoctorsList: (AddToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions_juniorDoctorsList | null)[];
  totalJuniorDoctors: number;
  isJdAllowed: boolean | null;
}

export interface AddToConsultQueueWithAutomatedQuestions {
  addToConsultQueueWithAutomatedQuestions: AddToConsultQueueWithAutomatedQuestions_addToConsultQueueWithAutomatedQuestions;
}

export interface AddToConsultQueueWithAutomatedQuestionsVariables {
  ConsultQueueInput?: ConsultQueueInput | null;
}
