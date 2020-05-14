/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DOCTOR_ONLINE_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateDoctorOnlineStatusDoctor
// ====================================================

export interface UpdateDoctorOnlineStatusDoctor_updateDoctorOnlineStatus_doctor {
  __typename: "DoctorDetails";
  id: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
}

export interface UpdateDoctorOnlineStatusDoctor_updateDoctorOnlineStatus {
  __typename: "UpdateDoctorOnlineStatusResult";
  doctor: UpdateDoctorOnlineStatusDoctor_updateDoctorOnlineStatus_doctor;
}

export interface UpdateDoctorOnlineStatusDoctor {
  updateDoctorOnlineStatus: UpdateDoctorOnlineStatusDoctor_updateDoctorOnlineStatus;
}

export interface UpdateDoctorOnlineStatusDoctorVariables {
  doctorId: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
}
