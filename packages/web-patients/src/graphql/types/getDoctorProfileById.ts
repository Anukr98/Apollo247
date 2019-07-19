/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDoctorProfileById
// ====================================================

export interface getDoctorProfileById_getDoctorProfileById_profile {
  __typename: "Doctor";
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
  typeOfConsult: string | null;
  inviteStatus: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById_clinics {
  __typename: "clinics";
  name: string | null;
  location: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById_starDoctorTeam {
  __typename: "Doctor";
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
  typeOfConsult: string | null;
  inviteStatus: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById_consultationHours {
  __typename: "Consultations";
  days: string | null;
  timings: string | null;
  availableForPhysicalConsultation: boolean | null;
  availableForVirtualConsultation: boolean | null;
  type: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById {
  __typename: "DoctorProfile";
  profile: getDoctorProfileById_getDoctorProfileById_profile | null;
  clinics: (getDoctorProfileById_getDoctorProfileById_clinics | null)[] | null;
  starDoctorTeam: (getDoctorProfileById_getDoctorProfileById_starDoctorTeam | null)[] | null;
  consultationHours: (getDoctorProfileById_getDoctorProfileById_consultationHours | null)[] | null;
}

export interface getDoctorProfileById {
  getDoctorProfileById: getDoctorProfileById_getDoctorProfileById | null;
}

export interface getDoctorProfileByIdVariables {
  id: string;
}
