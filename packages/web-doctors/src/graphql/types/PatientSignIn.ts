/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PatientSignIn
// ====================================================

export interface PatientSignInPatientSignInPatients {
  __typename: "Patient";
  id: string;
  mobileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  gender: Gender | null;
  uhid: string | null;
  dateOfBirth: string | null;
  emailAddress: string | null;
}

export interface PatientSignInPatientSignIn {
  __typename: "PatientSignInResult";
  patients: PatientSignInPatientSignInPatients[] | null;
}

export interface PatientSignIn {
  patientSignIn: PatientSignInPatientSignIn;
}

export interface PatientSignInVariables {
  jwt: string;
}
