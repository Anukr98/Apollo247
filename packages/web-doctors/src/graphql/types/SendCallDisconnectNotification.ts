/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPT_CALL_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: SendCallDisconnectNotification
// ====================================================

export interface SendCallDisconnectNotification_sendCallDisconnectNotification {
  __typename: "EndCallResult";
  status: boolean;
}

export interface SendCallDisconnectNotification {
  sendCallDisconnectNotification: SendCallDisconnectNotification_sendCallDisconnectNotification;
}

export interface SendCallDisconnectNotificationVariables {
  appointmentId: string;
  callType: APPT_CALL_TYPE;
}
