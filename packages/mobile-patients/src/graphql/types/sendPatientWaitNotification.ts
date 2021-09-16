/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: sendPatientWaitNotification
// ====================================================

export interface sendPatientWaitNotification_sendPatientWaitNotification {
  __typename: "sendPatientWaitNotificationResult";
  status: boolean | null;
}

export interface sendPatientWaitNotification {
  sendPatientWaitNotification: sendPatientWaitNotification_sendPatientWaitNotification | null;
}

export interface sendPatientWaitNotificationVariables {
  appointmentId: string;
}
