/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getNotifications
// ====================================================

export interface getNotifications_getNotifications_notificationData {
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

export interface getNotifications_getNotifications {
  __typename: "NotificationDataSet";
  notificationData: (getNotifications_getNotifications_notificationData | null)[] | null;
}

export interface getNotifications {
  getNotifications: getNotifications_getNotifications | null;
}

export interface getNotificationsVariables {
  toId: string;
  startDate?: any | null;
  endDate?: any | null;
}
