/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJuniorDoctorDashboard
// ====================================================

export interface GetJuniorDoctorDashboard_getJuniorDoctorDashboard_juniorDoctorDetails {
  __typename: "Profile";
  city: string | null;
  country: string | null;
  doctorType: DoctorType;
  emailAddress: string | null;
  firstName: string | null;
  gender: Gender | null;
  id: string;
}

export interface GetJuniorDoctorDashboard_getJuniorDoctorDashboard_juniorDoctorQueueItems {
  __typename: "QueuedConsults";
  doctorid: string | null;
  queuedconsultscount: number | null;
}

export interface GetJuniorDoctorDashboard_getJuniorDoctorDashboard {
  __typename: "DashoardData";
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
}
