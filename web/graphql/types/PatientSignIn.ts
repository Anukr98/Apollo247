/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Sex } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PatientSignIn
// ====================================================

export interface PatientSignIn_patientSignIn_patients {
  __typename: "Patient";
  id: string;
  mobileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  sex: Sex | null;
  uhid: string | null;
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
