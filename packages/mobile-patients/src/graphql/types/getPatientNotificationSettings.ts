/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPatientNotificationSettings
// ====================================================

export interface getPatientNotificationSettings_getPatientNotificationSettings_notificationSettings {
  __typename: "PatientNotificationSettings";
  id: string;
  commissionNotification: boolean;
  messageFromDoctorNotification: boolean;
  playNotificationSound: boolean;
  reScheduleAndCancellationNotification: boolean;
  paymentNotification: boolean;
  upcomingAppointmentReminders: boolean;
}

export interface getPatientNotificationSettings_getPatientNotificationSettings {
  __typename: "NotificationSettingsResult";
  notificationSettings: getPatientNotificationSettings_getPatientNotificationSettings_notificationSettings | null;
}

export interface getPatientNotificationSettings {
  getPatientNotificationSettings: getPatientNotificationSettings_getPatientNotificationSettings | null;
}

export interface getPatientNotificationSettingsVariables {
  patient: string;
}
