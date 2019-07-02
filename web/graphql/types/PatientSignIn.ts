/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Relation, Sex } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PatientSignIn
// ====================================================

export interface PatientSignIn_patientSignIn_patients {
  __typename: "Patient";
  id: string;
  mobileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  sex: Sex | null;
  uhid: string | null;
  dateOfBirth: string | null;
}

export interface PatientSignIn_patientSignIn {
  __typename: "PatientSignInResult";
  patients: PatientSignIn_patientSignIn_patients[] | null;
}

export interface PatientSignIn {
  patientSignIn: PatientSignIn_patientSignIn;
}

export interface PatientSignInVariables {
  jwt: string;
}
