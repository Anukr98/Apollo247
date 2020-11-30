/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddDiabeticQuestionnaireInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addDiabeticQuestionnaire
// ====================================================

export interface addDiabeticQuestionnaire_addDiabeticQuestionnaire {
  __typename: "AddDiabeticQuestionnaireResult";
  success: boolean;
}

export interface addDiabeticQuestionnaire {
  addDiabeticQuestionnaire: addDiabeticQuestionnaire_addDiabeticQuestionnaire;
}

export interface addDiabeticQuestionnaireVariables {
  addDiabeticQuestionnaireInput?: AddDiabeticQuestionnaireInput | null;
}
