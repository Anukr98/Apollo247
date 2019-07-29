/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { INVITEDSTATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorProfile
// ====================================================

export interface getDoctorProfile_getDoctorProfile_profile {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  experience: string | null;
  speciality: string;
  specialization: string | null;
  isStarDoctor: boolean;
  education: string;
  services: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  photoUrl: string | null;
  registrationNumber: string;
  isProfileComplete: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  package: string | null;
  inviteStatus: INVITEDSTATUS | null;
}

export interface getDoctorProfile_getDoctorProfile_paymentDetails {
  __typename: "PaymentDetails";
  accountNumber: string;
  address: string | null;
}

export interface getDoctorProfile_getDoctorProfile_clinics {
  __typename: "Clinics";
  name: string;
  image: string | null;
}

export interface getDoctorProfile_getDoctorProfile_starDoctorTeam {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  experience: string | null;
  speciality: string;
  specialization: string | null;
  isStarDoctor: boolean;
  education: string;
  services: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  photoUrl: string | null;
  registrationNumber: string;
  isProfileComplete: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  package: string | null;
  inviteStatus: INVITEDSTATUS | null;
}

export interface getDoctorProfile_getDoctorProfile_consultationHours {
  __typename: "Consultations";
  days: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
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
