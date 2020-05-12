/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType, Gender, DOCTOR_ONLINE_STATUS, Salutation, AccountType, ConsultMode, ConsultType, WeekDay } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RemoveSecretary
// ====================================================

export interface RemoveSecretary_removeSecretary_bankAccount {
  __typename: "BankAccount";
  accountHolderName: string;
  accountNumber: string;
  accountType: AccountType;
  bankName: string;
  city: string;
  id: string;
  IFSCcode: string;
  state: string | null;
  streetLine1: string | null;
}

export interface RemoveSecretary_removeSecretary_consultHours_facility {
  __typename: "Facility";
  city: string | null;
  country: string | null;
  facilityType: string;
  id: string;
  name: string;
}

export interface RemoveSecretary_removeSecretary_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  endTime: string;
  facility: RemoveSecretary_removeSecretary_consultHours_facility | null;
  id: string;
  isActive: boolean;
  startTime: string;
  weekDay: WeekDay;
}

export interface RemoveSecretary_removeSecretary_doctorHospital_facility {
  __typename: "Facility";
  city: string | null;
}

export interface RemoveSecretary_removeSecretary_doctorHospital {
  __typename: "DoctorHospital";
  facility: RemoveSecretary_removeSecretary_doctorHospital_facility;
}

export interface RemoveSecretary_removeSecretary_packages {
  __typename: "Packages";
  fees: string;
  id: string;
  name: string;
}

export interface RemoveSecretary_removeSecretary_specialty {
  __typename: "DoctorSpecialties";
  createdDate: string | null;
  id: string;
  image: string | null;
  name: string;
}

export interface RemoveSecretary_removeSecretary_starTeam_associatedDoctor {
  __typename: "Profile";
  city: string | null;
  country: string | null;
  id: string;
  lastName: string | null;
  firstName: string | null;
  fullName: string | null;
  mobileNumber: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  qualification: string | null;
}

export interface RemoveSecretary_removeSecretary_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
  associatedDoctor: RemoveSecretary_removeSecretary_starTeam_associatedDoctor | null;
}

export interface RemoveSecretary_removeSecretary {
  __typename: "DoctorDetails";
  awards: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: string | null;
  displayName: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firebaseToken: string | null;
  firstName: string;
  fullName: string | null;
  gender: Gender | null;
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
  thumbnailUrl: string | null;
  zip: string | null;
  bankAccount: (RemoveSecretary_removeSecretary_bankAccount | null)[] | null;
  consultHours: (RemoveSecretary_removeSecretary_consultHours | null)[] | null;
  doctorHospital: RemoveSecretary_removeSecretary_doctorHospital[];
  packages: (RemoveSecretary_removeSecretary_packages | null)[] | null;
  specialty: RemoveSecretary_removeSecretary_specialty | null;
  starTeam: (RemoveSecretary_removeSecretary_starTeam | null)[] | null;
}

export interface RemoveSecretary {
  removeSecretary: RemoveSecretary_removeSecretary | null;
}

export interface RemoveSecretaryVariables {
  secretaryId: string;
}
