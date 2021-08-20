/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SaveDeviceTokenInput, DEVICE_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveDeviceToken
// ====================================================

export interface saveDeviceToken_saveDeviceToken_deviceToken {
  __typename: "PatientDeviceTokens";
  id: string;
  deviceType: DEVICE_TYPE;
  deviceOS: string;
  deviceToken: string;
  createdDate: any;
  updatedDate: any | null;
  appVersion:string;
}

export interface saveDeviceToken_saveDeviceToken {
  __typename: "DeviceTokenResult";
  deviceToken: saveDeviceToken_saveDeviceToken_deviceToken | null;
}

export interface saveDeviceToken {
  saveDeviceToken: saveDeviceToken_saveDeviceToken;
}

export interface saveDeviceTokenVariables {
  SaveDeviceTokenInput: SaveDeviceTokenInput;
}
