/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteDoctorDeviceToken
// ====================================================

export interface deleteDoctorDeviceToken_deleteDoctorDeviceToken {
  __typename: "DoctorDeleteTokenResult";
  status: boolean | null;
}

export interface deleteDoctorDeviceToken {
  deleteDoctorDeviceToken: deleteDoctorDeviceToken_deleteDoctorDeviceToken | null;
}

export interface deleteDoctorDeviceTokenVariables {
  deviceToken?: string | null;
  doctorId?: string | null;
}
