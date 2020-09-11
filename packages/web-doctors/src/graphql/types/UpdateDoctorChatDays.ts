/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDoctorChatDays
// ====================================================

export interface UpdateDoctorChatDays_updateDoctorChatDays {
  __typename: "chatDaysResult";
  isError: boolean | null;
  response: string | null;
}

export interface UpdateDoctorChatDays {
  updateDoctorChatDays: UpdateDoctorChatDays_updateDoctorChatDays;
}

export interface UpdateDoctorChatDaysVariables {
  doctorId: string;
  chatDays: number;
}
