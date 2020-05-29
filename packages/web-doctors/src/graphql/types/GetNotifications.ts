/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetNotifications
// ====================================================

export interface GetNotifications_getNotifications_notificationData {
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
