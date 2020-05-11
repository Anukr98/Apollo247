/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LoggedInUserType, DoctorType, DOCTOR_ONLINE_STATUS, Salutation } from "./globalTypes";

// ====================================================
// GraphQL query operation: findLoggedinUserDetails
// ====================================================

export interface findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor_doctorHospital {
  __typename: "DoctorHospital";
  facility: findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor_doctorHospital_facility;
}

export interface findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor {
  __typename: "Profile";
  city: string | null;
  country: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
  mobileNumber: string;
  onlineConsultationFees: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string | null;
  salutation: Salutation | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zip: string | null;
  specialty: findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor_specialty;
  doctorHospital: findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor_doctorHospital[];
}

export interface findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary {
  __typename: "DoctorSecretary";
  doctor: findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary_doctor | null;
}

export interface findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails {
  __typename: "Secretary";
  name: string;
  doctorSecretary: (findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails_doctorSecretary | null)[] | null;
  mobileNumber: string;
  isActive: boolean;
}

export interface findLoggedinUserDetails_findLoggedinUserDetails {
  __typename: "LoggedInUserDetails";
  loggedInUserType: LoggedInUserType | null;
  secretaryDetails: findLoggedinUserDetails_findLoggedinUserDetails_secretaryDetails | null;
}

export interface findLoggedinUserDetails {
  findLoggedinUserDetails: findLoggedinUserDetails_findLoggedinUserDetails | null;
}
