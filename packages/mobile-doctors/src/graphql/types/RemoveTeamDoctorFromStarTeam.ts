/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: removeTeamDoctorFromStarTeam
// ====================================================

export interface removeTeamDoctorFromStarTeam_removeTeamDoctorFromStarTeam {
  __typename: "DoctorDetails";
  firstName: string;
}

export interface removeTeamDoctorFromStarTeam {
  removeTeamDoctorFromStarTeam: removeTeamDoctorFromStarTeam_removeTeamDoctorFromStarTeam | null;
}

export interface removeTeamDoctorFromStarTeamVariables {
  associatedDoctor: string;
  starDoctor: string;
}
