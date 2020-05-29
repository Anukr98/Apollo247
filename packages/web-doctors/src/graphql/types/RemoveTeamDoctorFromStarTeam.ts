/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveTeamDoctorFromStarTeam
// ====================================================

export interface RemoveTeamDoctorFromStarTeam_removeTeamDoctorFromStarTeam {
  __typename: "DoctorDetails";
  firstName: string;
}

export interface RemoveTeamDoctorFromStarTeam {
  removeTeamDoctorFromStarTeam: RemoveTeamDoctorFromStarTeam_removeTeamDoctorFromStarTeam | null;
}

export interface RemoveTeamDoctorFromStarTeamVariables {
  associatedDoctor?: string | null;
  starDoctor?: string | null;
}
