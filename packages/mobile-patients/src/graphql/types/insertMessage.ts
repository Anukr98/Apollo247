/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MessageInput, notificationEventName, notificationStatus, notificationType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: insertMessage
// ====================================================

export interface insertMessage_insertMessage_notificationData {
  __typename: "NotificationBinData";
  fromId: string;
  toId: string;
  eventName: notificationEventName;
  eventId: string;
  message: string;
  status: notificationStatus;
  type: notificationType;
  id: string | null;
}

export interface insertMessage_insertMessage {
  __typename: "NotificationData";
  notificationData: insertMessage_insertMessage_notificationData | null;
}

export interface insertMessage {
  insertMessage: insertMessage_insertMessage | null;
}

export interface insertMessageVariables {
  messageInput?: MessageInput | null;
}
