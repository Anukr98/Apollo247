/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDoctorProfile
// ====================================================

export interface getDoctorProfile_getDoctorProfile_clinicsList {
  __typename: "clinicsList";
  name: string | null;
  location: string | null;
}

export interface getDoctorProfile_getDoctorProfile_starDoctorTeam {
  __typename: "starDoctorTeam";
  firstName: string | null;
  lastName: string | null;
  experience: string | null;
  typeOfConsult: string | null;
  inviteStatus: string | null;
}

export interface getDoctorProfile_getDoctorProfile_consultationHours {
  __typename: "consultations";
  days: string | null;
  timings: string | null;
  availableForPhysicalConsultation: boolean | null;
  availableForVirtualConsultation: boolean | null;
  type: string | null;
}

export interface getDoctorProfile_getDoctorProfile {
  __typename: "DoctorProfile";
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
  experience: string | null;
  speciality: string | null;
  specialization: string | null;
  isStarDoctor: boolean | null;
  education: string | null;
  services: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  photoUrl: string | null;
  registrationNumber: string | null;
  isProfileComplete: string | null;
  availableForPhysicalConsultation: boolean | null;
  availableForVirtualConsultation: boolean | null;
  onlineConsultationFees: string | null;
  physicalConsultationFees: string | null;
  package: string | null;
  clinicsList: (getDoctorProfile_getDoctorProfile_clinicsList | null)[] | null;
  starDoctorTeam: (getDoctorProfile_getDoctorProfile_starDoctorTeam | null)[] | null;
  consultationHours: (getDoctorProfile_getDoctorProfile_consultationHours | null)[] | null;
}

export interface getDoctorProfile {
  getDoctorProfile: getDoctorProfile_getDoctorProfile | null;
}

export interface getDoctorProfileVariables {
  mobileNumber: string;
}
