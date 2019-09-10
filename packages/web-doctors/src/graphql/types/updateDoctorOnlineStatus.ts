/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DOCTOR_ONLINE_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateDoctorOnlineStatus
// ====================================================

export interface UpdateDoctorOnlineStatus_updateDoctorOnlineStatus_doctor {
  __typename: "DoctorDetails";
  onlineStatus: DOCTOR_ONLINE_STATUS;
}

export interface UpdateDoctorOnlineStatus_updateDoctorOnlineStatus {
  __typename: "UpdateDoctorOnlineStatusResult";
  doctor: UpdateDoctorOnlineStatus_updateDoctorOnlineStatus_doctor;
}

export interface UpdateDoctorOnlineStatus {
  updateDoctorOnlineStatus: UpdateDoctorOnlineStatus_updateDoctorOnlineStatus;
}

export interface UpdateDoctorOnlineStatusVariables {
  doctorId: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
}
