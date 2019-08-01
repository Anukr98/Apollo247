/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { INVITEDSTATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorProfileById
// ====================================================

export interface GetDoctorProfileById_getDoctorProfileById_profile {
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
  address: string | null;
}

export interface GetDoctorProfileById_getDoctorProfileById_clinics {
  __typename: "Clinics";
  name: string;
  image: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  city: string | null;
}

export interface GetDoctorProfileById_getDoctorProfileById_starDoctorTeam {
  __typename: "Doctor";
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  experience: string | null;
  speciality: string;
  specialization: string | null;
  education: string;
  services: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  photoUrl: string | null;
  package: string | null;
  inviteStatus: INVITEDSTATUS | null;
  address: string | null;
}

export interface GetDoctorProfileById_getDoctorProfileById_consultationHours {
  __typename: "Consultations";
  days: string;
  startTime: any;
  endTime: any;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  type: string | null;
}

export interface GetDoctorProfileById_getDoctorProfileById {
  __typename: "DoctorProfile";
  profile: GetDoctorProfileById_getDoctorProfileById_profile;
  clinics: GetDoctorProfileById_getDoctorProfileById_clinics[] | null;
  starDoctorTeam: GetDoctorProfileById_getDoctorProfileById_starDoctorTeam[] | null;
  consultationHours: GetDoctorProfileById_getDoctorProfileById_consultationHours[] | null;
}

export interface GetDoctorProfileById {
  getDoctorProfileById: GetDoctorProfileById_getDoctorProfileById | null;
}

export interface GetDoctorProfileByIdVariables {
  id: string;
}
