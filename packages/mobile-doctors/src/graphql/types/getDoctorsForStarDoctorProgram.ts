/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDoctorsForStarDoctorProgram
// ====================================================

export interface getDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
}

export interface getDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram {
  __typename: "StarDoctorProfile";
  profile: getDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile | null;
}

export interface getDoctorsForStarDoctorProgram {
  getDoctorsForStarDoctorProgram: (getDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram | null)[] | null;
}

export interface getDoctorsForStarDoctorProgramVariables {
  searchString: string;
}
