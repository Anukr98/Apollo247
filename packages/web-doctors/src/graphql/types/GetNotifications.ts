/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { notificationEventName, notificationStatus, notificationType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetNotifications
// ====================================================

export interface GetNotifications_getNotifications_notificationData {
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

export interface GetNotifications_getNotifications {
  __typename: "NotificationDataSet";
  notificationData: (GetNotifications_getNotifications_notificationData | null)[] | null;
}

export interface GetNotifications {
  getNotifications: GetNotifications_getNotifications | null;
}

export interface GetNotificationsVariables {
  toId: string;
  startDate?: any | null;
  endDate?: any | null;
}
