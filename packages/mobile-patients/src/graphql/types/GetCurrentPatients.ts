/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DEVICE_TYPE, Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCurrentPatients
// ====================================================

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
  weight: string | null;
}

export interface GetCurrentPatients_getCurrentPatients_patients {
  __typename: "Patient";
  id: string;
  mobileNumber: string;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  uhid: string | null;
  gender: Gender | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  photoUrl: string | null;
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
}
