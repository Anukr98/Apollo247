/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType, ConsultMode, ConsultType, WeekDay, AccountType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorDetails
// ====================================================

export interface GetDoctorDetails_getDoctorDetails_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  specialistSingularTerm: string | null;
  specialistPluralTerm: string | null;
  userFriendlyNomenclature: string | null;
}

export interface GetDoctorDetails_getDoctorDetails_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  startTime: string;
  endTime: string;
  weekDay: WeekDay;
  isActive: boolean;
  consultDuration: number | null;
  consultBuffer: number | null;
}

export interface GetDoctorDetails_getDoctorDetails_packages {
  __typename: "Packages";
  name: string;
  fees: string;
}

export interface GetDoctorDetails_getDoctorDetails_doctorHospital_facility {
  __typename: "Facility";
  city: string | null;
  country: string | null;
  facilityType: string;
  id: string;
  imageUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  name: string;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zipcode: string | null;
}

export interface GetDoctorDetails_getDoctorDetails_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetails_getDoctorDetails_doctorHospital_facility;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital_facility {
  __typename: "Facility";
  state: string | null;
  city: string | null;
  country: string | null;
  streetLine1: string | null;
  streetLine3: string | null;
  streetLine2: string | null;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital_facility;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor {
  __typename: "Profile";
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  id: string;
  experience: string | null;
  photoUrl: string | null;
  mobileNumber: string;
  salutation: string | null;
  qualification: string | null;
  doctorHospital: GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital[];
}

export interface GetDoctorDetails_getDoctorDetails_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
  associatedDoctor: GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor | null;
}

export interface GetDoctorDetails_getDoctorDetails_doctorSecretary_secretary {
  __typename: "Secretary";
  id: string;
  isActive: boolean;
  name: string;
  mobileNumber: string;
}

export interface GetDoctorDetails_getDoctorDetails_doctorSecretary {
  __typename: "DoctorSecretaryDetails";
  secretary: GetDoctorDetails_getDoctorDetails_doctorSecretary_secretary | null;
}

export interface GetDoctorDetails_getDoctorDetails_bankAccount {
  __typename: "BankAccount";
  bankName: string;
  accountType: AccountType;
  accountNumber: string;
  accountHolderName: string;
  IFSCcode: string;
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
  fullName: string | null;
  displayName: string | null;
  firstName: string;
  isActive: boolean;
  id: string;
  chatDays: number | null;
  languages: string | null;
  lastName: string;
  mobileNumber: string;
  onlineConsultationFees: string;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string;
  salutation: string | null;
  specialization: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zip: string | null;
  signature: string | null;
  isIvrSet: boolean | null;
  ivrConsultType: ConsultMode | null;
  ivrCallTimeOnline: number | null;
  ivrCallTimePhysical: number | null;
  specialty: GetDoctorDetails_getDoctorDetails_specialty | null;
  consultHours: (GetDoctorDetails_getDoctorDetails_consultHours | null)[] | null;
  packages: (GetDoctorDetails_getDoctorDetails_packages | null)[] | null;
  doctorHospital: GetDoctorDetails_getDoctorDetails_doctorHospital[];
  starTeam: (GetDoctorDetails_getDoctorDetails_starTeam | null)[] | null;
  doctorSecretary: GetDoctorDetails_getDoctorDetails_doctorSecretary | null;
  bankAccount: (GetDoctorDetails_getDoctorDetails_bankAccount | null)[] | null;
}

export interface GetDoctorDetails {
  getDoctorDetails: GetDoctorDetails_getDoctorDetails | null;
}
