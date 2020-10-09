/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MessageInput, notificationEventName, notificationStatus, notificationType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: InsertMessage
// ====================================================

export interface InsertMessage_insertMessage_notificationData {
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

export interface InsertMessage_insertMessage {
  __typename: "NotificationData";
  notificationData: InsertMessage_insertMessage_notificationData | null;
}

export interface InsertMessage {
  insertMessage: InsertMessage_insertMessage | null;
}

export interface InsertMessageVariables {
  messageInput?: MessageInput | null;
}
