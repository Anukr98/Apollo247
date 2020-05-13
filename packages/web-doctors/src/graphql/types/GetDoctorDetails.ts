/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType, DOCTOR_ONLINE_STATUS, Salutation, WeekDay, ConsultMode, ConsultType, AccountType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorDetails
// ====================================================

export interface GetDoctorDetails_getDoctorDetails_doctorSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
}

export interface GetDoctorDetails_getDoctorDetails_doctorSecretary {
  __typename: "DoctorSecretaryDetails";
  secretary: GetDoctorDetails_getDoctorDetails_doctorSecretary_secretary | null;
}

export interface GetDoctorDetails_getDoctorDetails_consultHours {
  __typename: "ConsultHours";
  actualDay: WeekDay | null;
  consultMode: ConsultMode;
  startTime: string;
  endTime: string;
  consultType: ConsultType;
  weekDay: WeekDay;
  consultDuration: number | null;
}

export interface GetDoctorDetails_getDoctorDetails_packages {
  __typename: "Packages";
  name: string;
  fees: string;
}

export interface GetDoctorDetails_getDoctorDetails_bankAccount {
  __typename: "BankAccount";
  accountNumber: string;
  state: string | null;
  IFSCcode: string;
  accountType: AccountType;
  bankName: string;
  accountHolderName: string;
}

export interface GetDoctorDetails_getDoctorDetails_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface GetDoctorDetails_getDoctorDetails_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface GetDoctorDetails_getDoctorDetails_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetails_getDoctorDetails_doctorHospital_facility;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital_facility {
  __typename: "Facility";
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital_facility;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor {
  __typename: "Profile";
  country: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
  mobileNumber: string;
  photoUrl: string | null;
  qualification: string | null;
  salutation: Salutation | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zip: string | null;
  doctorHospital: GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_doctorHospital[];
  specialty: GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor_specialty;
}

export interface GetDoctorDetails_getDoctorDetails_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
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
  displayName: string | null;
  emailAddress: string | null;
  experience: string | null;
  firebaseToken: string | null;
  firstName: string;
  isActive: boolean;
  id: string;
  languages: string | null;
  lastName: string;
  mobileNumber: string;
  onlineConsultationFees: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
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
  doctorSecretary: GetDoctorDetails_getDoctorDetails_doctorSecretary | null;
  consultHours: (GetDoctorDetails_getDoctorDetails_consultHours | null)[] | null;
  packages: (GetDoctorDetails_getDoctorDetails_packages | null)[] | null;
  bankAccount: (GetDoctorDetails_getDoctorDetails_bankAccount | null)[] | null;
  specialty: GetDoctorDetails_getDoctorDetails_specialty | null;
  doctorHospital: GetDoctorDetails_getDoctorDetails_doctorHospital[];
  starTeam: (GetDoctorDetails_getDoctorDetails_starTeam | null)[] | null;
}

export interface GetDoctorDetails {
  getDoctorDetails: GetDoctorDetails_getDoctorDetails | null;
}
