/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Salutation, DOCTOR_ONLINE_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJuniorDoctorDashboard
// ====================================================

export interface GetJuniorDoctorDashboard_getJuniorDoctorDashboard_juniorDoctorDetails {
  __typename: "Profile";
  firstName: string | null;
  lastName: string | null;
  salutation: Salutation | null;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  id: string;
}

export interface GetJuniorDoctorDashboard_getJuniorDoctorDashboard_juniorDoctorQueueItems {
  __typename: "QueuedConsults";
  doctorid: string | null;
  queuedconsultscount: number | null;
}

export interface GetJuniorDoctorDashboard_getJuniorDoctorDashboard {
  __typename: "DashboardData";
  consultsBookedButNotInQueue: number | null;
  juniorDoctorDetails: (GetJuniorDoctorDashboard_getJuniorDoctorDashboard_juniorDoctorDetails | null)[] | null;
  juniorDoctorQueueItems: (GetJuniorDoctorDashboard_getJuniorDoctorDashboard_juniorDoctorQueueItems | null)[] | null;
}

export interface GetJuniorDoctorDashboard {
  getJuniorDoctorDashboard: GetJuniorDoctorDashboard_getJuniorDoctorDashboard | null;
}

export interface GetJuniorDoctorDashboardVariables {
  fromDate: any;
  toDate: any;
  offset: number;
  limit: number;
}
