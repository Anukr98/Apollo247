/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SendMessageToMobileNumber
// ====================================================

export interface SendMessageToMobileNumber_sendMessageToMobileNumber {
  __typename: "SendSMS";
  status: string | null;
  message: string | null;
}

export interface SendMessageToMobileNumber {
  sendMessageToMobileNumber: SendMessageToMobileNumber_sendMessageToMobileNumber | null;
}

export interface SendMessageToMobileNumberVariables {
  mobileNumber?: string | null;
  textToSend?: string | null;
}
