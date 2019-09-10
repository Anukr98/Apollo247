/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DOCTOR_ONLINE_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateDoctorOnlineStatus
// ====================================================

export interface updateDoctorOnlineStatus_updateDoctorOnlineStatus_doctor {
  __typename: "DoctorDetails";
  onlineStatus: DOCTOR_ONLINE_STATUS;
}

export interface updateDoctorOnlineStatus_updateDoctorOnlineStatus {
  __typename: "UpdateDoctorOnlineStatusResult";
  doctor: updateDoctorOnlineStatus_updateDoctorOnlineStatus_doctor;
}

export interface updateDoctorOnlineStatus {
  updateDoctorOnlineStatus: updateDoctorOnlineStatus_updateDoctorOnlineStatus;
}

export interface updateDoctorOnlineStatusVariables {
  doctorId: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
}
