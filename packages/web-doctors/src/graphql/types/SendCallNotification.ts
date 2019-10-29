/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SendCallNotification
// ====================================================

export interface SendCallNotification_sendCallNotification {
  __typename: "NotificationResult";
  status: boolean;
}

export interface SendCallNotification {
  sendCallNotification: SendCallNotification_sendCallNotification;
}

export interface SendCallNotificationVariables {
  appointmentId?: string | null;
}
