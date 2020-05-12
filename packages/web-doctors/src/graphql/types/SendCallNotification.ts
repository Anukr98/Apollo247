/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPT_CALL_TYPE, DOCTOR_CALL_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: SendCallNotification
// ====================================================

export interface SendCallNotification_sendCallNotification_callDetails {
  __typename: "AppointmentCallDetails";
  id: string;
}

export interface SendCallNotification_sendCallNotification {
  __typename: "NotificationResult";
  status: boolean;
  callDetails: SendCallNotification_sendCallNotification_callDetails;
}

export interface SendCallNotification {
  sendCallNotification: SendCallNotification_sendCallNotification;
}

export interface SendCallNotificationVariables {
  appointmentId?: string | null;
  callType?: APPT_CALL_TYPE | null;
  doctorType?: DOCTOR_CALL_TYPE | null;
}
