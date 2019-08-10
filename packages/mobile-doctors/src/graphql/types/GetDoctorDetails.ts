/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType, Gender, Salutation, ConsultMode, ConsultType, WeekDay } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorDetails
// ====================================================

export interface GetDoctorDetails_getDoctorDetails_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface GetDoctorDetails_getDoctorDetails_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  startTime: string;
  endTime: string;
  weekDay: WeekDay;
}

export interface GetDoctorDetails_getDoctorDetails_packages {
  __typename: "Packages";
  name: string;
  fees: string;
}

export interface GetDoctorDetails_getDoctorDetails_doctorHospital_facility {
  __typename: "Facility";
  name: string;
}

export interface GetDoctorDetails_getDoctorDetails_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetails_getDoctorDetails_doctorHospital_facility;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor {
  __typename: "Profile";
  firstName: string | null;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam {
  __typename: "StarTeam";
  associatedDoctor: GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor | null;
}

export interface GetDoctorDetails_getDoctorDetails {
  __typename: "DoctorDetails";
  awards: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firebaseToken: string | null;
  firstName: string;
  gender: Gender | null;
  isActive: boolean;
  id: string;
  languages: string | null;
  lastName: string;
  mobileNumber: string;
  onlineConsultationFees: string;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string;
  salutation: Salutation | null;
  specialization: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zip: string | null;
  specialty: GetDoctorDetails_getDoctorDetails_specialty;
  consultHours: (GetDoctorDetails_getDoctorDetails_consultHours | null)[] | null;
  packages: (GetDoctorDetails_getDoctorDetails_packages | null)[] | null;
  doctorHospital: GetDoctorDetails_getDoctorDetails_doctorHospital[];
  starTeam: (GetDoctorDetails_getDoctorDetails_starTeam | null)[] | null;
}

export interface GetDoctorDetails {
  getDoctorDetails: GetDoctorDetails_getDoctorDetails | null;
}
