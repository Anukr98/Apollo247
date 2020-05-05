/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: MarkMessageToUnread
// ====================================================

export interface MarkMessageToUnread_markMessageToUnread_notificationData {
  __typename: "GetNotificationsResponse";
  appointmentId: string | null;
  doctorId: string | null;
  lastUnreadMessageDate: any | null;
  patientId: string | null;
  patientFirstName: string | null;
  patientLastName: string | null;
  patientPhotoUrl: string | null;
  unreadNotificationsCount: number | null;
}

export interface MarkMessageToUnread_markMessageToUnread {
  __typename: "NotificationDataSet";
  notificationData: (MarkMessageToUnread_markMessageToUnread_notificationData | null)[] | null;
}

export interface MarkMessageToUnread {
  markMessageToUnread: MarkMessageToUnread_markMessageToUnread | null;
}

export interface MarkMessageToUnreadVariables {
  eventId?: string | null;
}
