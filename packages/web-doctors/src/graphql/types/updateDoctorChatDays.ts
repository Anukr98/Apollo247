/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateDoctorChatDays
// ====================================================

export interface updateDoctorChatDays_updateDoctorChatDays {
  __typename: "chatDaysResult";
  isError: boolean | null;
  response: string | null;
}

export interface updateDoctorChatDays {
  updateDoctorChatDays: updateDoctorChatDays_updateDoctorChatDays;
}

export interface updateDoctorChatDaysVariables {
  doctorId: string;
  chatDays: number;
}
