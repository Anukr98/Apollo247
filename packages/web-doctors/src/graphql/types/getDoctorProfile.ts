/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { INVITEDSTATUS } from './globalTypes';

// ====================================================
// GraphQL query operation: GetDoctorProfile
// ====================================================

export interface GetDoctorProfile_getDoctorProfile_profile {
  __typename: 'Doctor';
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

export interface GetDoctorProfile_getDoctorProfile_paymentDetails {
  __typename: 'PaymentDetails';
  accountNumber: string;
  address: string | null;
}

export interface GetDoctorProfile_getDoctorProfile_clinics {
  __typename: 'Clinics';
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  city: string | null;
}

export interface GetDoctorProfile_getDoctorProfile_starDoctorTeam {
  __typename: 'Doctor';
  firstName: string;
  lastName: string;
  experience: string | null;
  inviteStatus: INVITEDSTATUS | null;
}

export interface GetDoctorProfile_getDoctorProfile_consultationHours {
  __typename: 'Consultations';
  days: string;
  startTime: any;
  endTime: any;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  type: string | null;
}

export interface GetDoctorProfile_getDoctorProfile {
  __typename: 'DoctorProfile';
  profile: GetDoctorProfile_getDoctorProfile_profile;
  paymentDetails: GetDoctorProfile_getDoctorProfile_paymentDetails[] | null;
  clinics: GetDoctorProfile_getDoctorProfile_clinics[] | null;
  starDoctorTeam: GetDoctorProfile_getDoctorProfile_starDoctorTeam[] | null;
  consultationHours: GetDoctorProfile_getDoctorProfile_consultationHours[] | null;
}

export interface GetDoctorProfile {
  getDoctorProfile: GetDoctorProfile_getDoctorProfile | null;
}
