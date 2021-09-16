/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDeviceCodeCount
// ====================================================

export interface getDeviceCodeCount_getDeviceCodeCount {
  __typename: "DeviceCountResponse";
  deviceCount: number | null;
}

export interface getDeviceCodeCount {
  getDeviceCodeCount: getDeviceCodeCount_getDeviceCodeCount | null;
}

export interface getDeviceCodeCountVariables {
  deviceCode: string;
}
