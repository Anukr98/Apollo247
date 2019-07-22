/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { INVITEDSTATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorProfileById
// ====================================================

export interface getDoctorProfileById_getDoctorProfileById_profile {
  __typename: "Doctor";
  id: string;
  salutation: string;
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

export interface getDoctorProfileById_getDoctorProfileById_paymentDetails {
  __typename: "PaymentDetails";
  accountNumber: string;
  address: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById_clinics {
  __typename: "Clinics";
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  city: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById_starDoctorTeam {
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

export interface getDoctorProfileById_getDoctorProfileById_consultationHours {
  __typename: "Consultations";
  days: string;
  startTime: any;
  endTime: any;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  type: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById {
  __typename: "DoctorProfile";
  profile: getDoctorProfileById_getDoctorProfileById_profile | null;
  paymentDetails: (getDoctorProfileById_getDoctorProfileById_paymentDetails | null)[] | null;
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
