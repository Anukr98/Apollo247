/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPT_CALL_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: sendCallDisconnectNotification
// ====================================================

export interface sendCallDisconnectNotification_sendCallDisconnectNotification {
  __typename: "EndCallResult";
  status: boolean;
}

export interface sendCallDisconnectNotification {
  sendCallDisconnectNotification: sendCallDisconnectNotification_sendCallDisconnectNotification;
}

export interface sendCallDisconnectNotificationVariables {
  appointmentId?: string | null;
  callType?: APPT_CALL_TYPE | null;
}
