/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDoctorsForStarDoctorProgram
// ====================================================

export interface GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
}

export interface GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram {
  __typename: "StarDoctorProfile";
  profile: GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile | null;
}

export interface GetDoctorsForStarDoctorProgram {
  getDoctorsForStarDoctorProgram: (GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram | null)[] | null;
}

export interface GetDoctorsForStarDoctorProgramVariables {
  searchString: string;
}
