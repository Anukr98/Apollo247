/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { INVITEDSTATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorsForStarDoctorProgram
// ====================================================

export interface GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
  inviteStatus: INVITEDSTATUS | null;
  experience: string | null;
}

export interface GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_starDoctorTeam {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
  inviteStatus: INVITEDSTATUS | null;
  experience: string | null;
}

export interface GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram {
  __typename: "StarDoctorProfile";
  profile: GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile | null;
  starDoctorTeam: (GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_starDoctorTeam | null)[] | null;
}

export interface GetDoctorsForStarDoctorProgram {
  getDoctorsForStarDoctorProgram: (GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram | null)[] | null;
}

export interface GetDoctorsForStarDoctorProgramVariables {
  searchString: string;
}
