/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: EndCallNotification
// ====================================================

export interface EndCallNotification_endCallNotification {
  __typename: "EndCallResult";
  status: boolean;
}

export interface EndCallNotification {
  endCallNotification: EndCallNotification_endCallNotification;
}

export interface EndCallNotificationVariables {
  appointmentCallId?: string | null;
}
