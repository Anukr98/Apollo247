/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SaveDoctorDeviceTokenInput, DOCTOR_DEVICE_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveDoctorDeviceToken
// ====================================================

export interface saveDoctorDeviceToken_saveDoctorDeviceToken_deviceToken {
  __typename: "DoctorDeviceTokens";
  id: string;
  deviceType: DOCTOR_DEVICE_TYPE;
  deviceOS: string;
  deviceToken: string;
  createdDate: any;
  updatedDate: any | null;
}

export interface saveDoctorDeviceToken_saveDoctorDeviceToken {
  __typename: "DoctorDeviceTokenResult";
  deviceToken: saveDoctorDeviceToken_saveDoctorDeviceToken_deviceToken | null;
}

export interface saveDoctorDeviceToken {
  saveDoctorDeviceToken: saveDoctorDeviceToken_saveDoctorDeviceToken;
}

export interface saveDoctorDeviceTokenVariables {
  SaveDoctorDeviceTokenInput: SaveDoctorDeviceTokenInput;
}
