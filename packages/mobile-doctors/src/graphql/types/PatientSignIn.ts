/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Gender, ErrorMsgs, Relation } from './globalTypes';

// ====================================================
// GraphQL mutation operation: PatientSignIn
// ====================================================

export interface PatientSignIn_patientSignIn_patients {
  __typename: 'Patient';
  id: string;
  firstName: string | null;
  lastName: string | null;
  uhid: string | null;
  gender: Gender | null;
  mobileNumber: string | null;
  relation: Relation | null;
}

export interface PatientSignIn_patientSignIn_errors {
  __typename: 'Error';
  messages: ErrorMsgs[];
}

export interface PatientSignIn_patientSignIn {
  __typename: 'PatientSignInResult';
  patients: PatientSignIn_patientSignIn_patients[] | null;
  errors: PatientSignIn_patientSignIn_errors | null;
}

export interface PatientSignIn {
  patientSignIn: PatientSignIn_patientSignIn;
}

export interface PatientSignInVariables {
  jwt: string;
}
