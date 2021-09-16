/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DEVICE_TYPE, Gender, Relation, BloodGroups } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCurrentPatients
// ====================================================

export interface GetCurrentPatients_getCurrentPatients_patients_familyHistory {
  __typename: "FamilyHistory";
  description: string | null;
  relation: string | null;
}

export interface GetCurrentPatients_getCurrentPatients_patients_lifeStyle {
  __typename: "LifeStyle";
  description: string | null;
  occupationHistory: string | null;
}

export interface GetCurrentPatients_getCurrentPatients_patients_patientMedicalHistory {
  __typename: "MedicalHistory";
  bp: string | null;
  dietAllergies: string | null;
  drugAllergies: string | null;
  height: string | null;
  menstrualHistory: string | null;
  pastMedicalHistory: string | null;
  pastSurgicalHistory: string | null;
  temperature: string | null;
  bloodGroup: BloodGroups | null;
  weight: string | null;
}

export interface GetCurrentPatients_getCurrentPatients_patients {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string;
  dateOfBirth: any | null;
  emailAddress: string | null;
  gender: Gender | null;
  relation: Relation | null;
  photoUrl: string | null;
  athsToken: string | null;
  referralCode: string | null;
  isLinked: boolean | null;
  isUhidPrimary: boolean | null;
  primaryUhid: string | null;
  primaryPatientId: string | null;
  whatsAppMedicine: boolean | null;
  whatsAppConsult: boolean | null;
  familyHistory: (GetCurrentPatients_getCurrentPatients_patients_familyHistory | null)[] | null;
  lifeStyle: (GetCurrentPatients_getCurrentPatients_patients_lifeStyle | null)[] | null;
  patientMedicalHistory: GetCurrentPatients_getCurrentPatients_patients_patientMedicalHistory | null;
}

export interface GetCurrentPatients_getCurrentPatients {
  __typename: "GetCurrentPatientsResult";
  patients: GetCurrentPatients_getCurrentPatients_patients[];
}

export interface GetCurrentPatients {
  getCurrentPatients: GetCurrentPatients_getCurrentPatients | null;
}

export interface GetCurrentPatientsVariables {
  appVersion?: string | null;
  deviceType?: DEVICE_TYPE | null;
  deviceToken?: string | null;
  deviceOS?: string | null;
}
