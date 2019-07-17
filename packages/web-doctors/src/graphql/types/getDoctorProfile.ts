/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDoctorProfile
// ====================================================

export interface getDoctorProfile_getDoctorProfile_profile {
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
  inviteStatus: string | null;
  typeOfConsult: string | null;
}

export interface getDoctorProfile_getDoctorProfile_paymentDetails {
  __typename: "PaymentDetails";
  accountNumber: string | null;
  address: string | null;
}

export interface getDoctorProfile_getDoctorProfile_clinics {
  __typename: "clinics";
  name: string | null;
  location: string | null;
}

export interface getDoctorProfile_getDoctorProfile_starDoctorTeam {
  __typename: "Doctor";
  firstName: string | null;
  lastName: string | null;
  experience: string | null;
  typeOfConsult: string | null;
  inviteStatus: string | null;
}

export interface getDoctorProfile_getDoctorProfile_consultationHours {
  __typename: "Consultations";
  days: string | null;
  timings: string | null;
  availableForPhysicalConsultation: boolean | null;
  availableForVirtualConsultation: boolean | null;
  type: string | null;
}

export interface getDoctorProfile_getDoctorProfile {
  __typename: "DoctorProfile";
  profile: getDoctorProfile_getDoctorProfile_profile | null;
  paymentDetails: (getDoctorProfile_getDoctorProfile_paymentDetails | null)[] | null;
  clinics: (getDoctorProfile_getDoctorProfile_clinics | null)[] | null;
  starDoctorTeam: (getDoctorProfile_getDoctorProfile_starDoctorTeam | null)[] | null;
  consultationHours: (getDoctorProfile_getDoctorProfile_consultationHours | null)[] | null;
}

export interface getDoctorProfile {
  getDoctorProfile: getDoctorProfile_getDoctorProfile | null;
}
