/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SavePatientNotificationSettingsInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: savePatientNotificationSettings
// ====================================================

export interface savePatientNotificationSettings_savePatientNotificationSettings {
  __typename: "SavePatientNotificationSettingsResult";
  status: boolean | null;
}

export interface savePatientNotificationSettings {
  savePatientNotificationSettings: savePatientNotificationSettings_savePatientNotificationSettings;
}

export interface savePatientNotificationSettingsVariables {
  notificationSettingsInput: SavePatientNotificationSettingsInput;
}
