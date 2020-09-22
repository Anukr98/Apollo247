/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { notificationEventName, notificationStatus, notificationType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MarkMessageToUnread
// ====================================================

export interface MarkMessageToUnread_markMessageToUnread_notificationData {
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

export interface MarkMessageToUnread_markMessageToUnread {
  __typename: "NotificationBinDataSet";
  notificationData: (MarkMessageToUnread_markMessageToUnread_notificationData | null)[] | null;
}

export interface MarkMessageToUnread {
  markMessageToUnread: MarkMessageToUnread_markMessageToUnread | null;
}

export interface MarkMessageToUnreadVariables {
  eventId?: string | null;
}
