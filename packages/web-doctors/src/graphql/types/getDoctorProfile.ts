/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDoctorProfile
// ====================================================

export interface getDoctorProfileGetDoctorProfileClinicsList {
  __typename: "clinicsList";
  name: string | null;
  location: string | null;
}

export interface getDoctorProfileGetDoctorProfileStarDoctorTeam {
  __typename: "starDoctorTeam";
  firstName: string | null;
  lastName: string | null;
  experience: string | null;
  typeOfConsult: string | null;
  inviteStatus: string | null;
}

export interface getDoctorProfileGetDoctorProfile {
  __typename: "DoctorProfile";
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
  experience: string | null;
  speciality: string | null;
  isStarDoctor: boolean | null;
  education: string | null;
  services: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  clinicsList: (getDoctorProfileGetDoctorProfileClinicsList | null)[] | null;
  starDoctorTeam: (getDoctorProfileGetDoctorProfileStarDoctorTeam | null)[] | null;
}

export interface getDoctorProfile {
  getDoctorProfile: getDoctorProfileGetDoctorProfile | null;
}

export interface getDoctorProfileVariables {
  mobileNumber: string;
}
