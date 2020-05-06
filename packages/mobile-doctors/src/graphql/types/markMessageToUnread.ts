/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { notificationEventName, notificationStatus, notificationType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: markMessageToUnread
// ====================================================

export interface markMessageToUnread_markMessageToUnread_notificationData {
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

export interface markMessageToUnread_markMessageToUnread {
  __typename: "NotificationBinDataSet";
  notificationData: (markMessageToUnread_markMessageToUnread_notificationData | null)[] | null;
}

export interface markMessageToUnread {
  markMessageToUnread: markMessageToUnread_markMessageToUnread | null;
}

export interface markMessageToUnreadVariables {
  eventId?: string | null;
}
