/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: sendChatMessageToDoctor
// ====================================================

export interface sendChatMessageToDoctor_sendChatMessageToDoctor {
  __typename: "SendChatMessageToDoctorResult";
  status: boolean | null;
}

export interface sendChatMessageToDoctor {
  sendChatMessageToDoctor: sendChatMessageToDoctor_sendChatMessageToDoctor | null;
}

export interface sendChatMessageToDoctorVariables {
  appointmentId?: string | null;
}
