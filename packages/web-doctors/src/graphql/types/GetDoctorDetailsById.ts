/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorType, DOCTOR_ONLINE_STATUS, Salutation, ConsultMode, ConsultType, WeekDay, AccountType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorDetailsById
// ====================================================

export interface GetDoctorDetailsById_getDoctorDetailsById_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  startTime: string;
  endTime: string;
  consultType: ConsultType;
  weekDay: WeekDay;
  actualDay: WeekDay | null;
  consultDuration: number | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_packages {
  __typename: "Packages";
  name: string;
  fees: string;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_bankAccount {
  __typename: "BankAccount";
  accountNumber: string;
  state: string | null;
  IFSCcode: string;
  accountType: AccountType;
  bankName: string;
  accountHolderName: string;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetailsById_getDoctorDetailsById_doctorHospital_facility;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital_facility {
  __typename: "Facility";
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital_facility;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor {
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
  doctorHospital: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital[];
  specialty: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_specialty;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
  associatedDoctor: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById {
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
  displayName: string | null;
  firstName: string;
  isActive: boolean;
  onlineStatus: DOCTOR_ONLINE_STATUS;
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
  consultHours: (GetDoctorDetailsById_getDoctorDetailsById_consultHours | null)[] | null;
  packages: (GetDoctorDetailsById_getDoctorDetailsById_packages | null)[] | null;
  bankAccount: (GetDoctorDetailsById_getDoctorDetailsById_bankAccount | null)[] | null;
  specialty: GetDoctorDetailsById_getDoctorDetailsById_specialty | null;
  doctorHospital: GetDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  starTeam: (GetDoctorDetailsById_getDoctorDetailsById_starTeam | null)[] | null;
}

export interface GetDoctorDetailsById {
  getDoctorDetailsById: GetDoctorDetailsById_getDoctorDetailsById | null;
}

export interface GetDoctorDetailsByIdVariables {
  id?: string | null;
}
