/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DEVICETYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePatientAppVersion
// ====================================================

export interface UpdatePatientAppVersion_updatePatientAppVersion {
  __typename: "appVersionResult";
  status: boolean | null;
}

export interface UpdatePatientAppVersion {
  updatePatientAppVersion: UpdatePatientAppVersion_updatePatientAppVersion;
}

export interface UpdatePatientAppVersionVariables {
  patientId: string;
  appVersion: string;
  osType?: DEVICETYPE | null;
  appsflyerId?: string | null;
}
