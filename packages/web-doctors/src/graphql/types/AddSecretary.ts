/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType, Gender, DOCTOR_ONLINE_STATUS, Salutation } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AddSecretary
// ====================================================

export interface AddSecretary_addSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface AddSecretary_addSecretary_doctor_doctorHospital_facility {
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

export interface AddSecretary_addSecretary_doctor_doctorHospital {
  __typename: "DoctorHospital";
  facility: AddSecretary_addSecretary_doctor_doctorHospital_facility;
}

export interface AddSecretary_addSecretary_doctor {
  __typename: "Profile";
  city: string | null;
  country: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firstName: string | null;
  fullName: string | null;
  gender: Gender | null;
  id: string;
  lastName: string | null;
  mobileNumber: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  photoUrl: string | null;
  qualification: string | null;
  salutation: Salutation | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  thumbnailUrl: string | null;
  displayName: string | null;
  zip: string | null;
  registrationNumber: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  doctorHospital: AddSecretary_addSecretary_doctor_doctorHospital[];
}

export interface AddSecretary_addSecretary {
  __typename: "DoctorSecretaryData";
  secretary: AddSecretary_addSecretary_secretary | null;
  doctor: AddSecretary_addSecretary_doctor | null;
}

export interface AddSecretary {
  addSecretary: AddSecretary_addSecretary | null;
}

export interface AddSecretaryVariables {
  secretaryId: string;
}
