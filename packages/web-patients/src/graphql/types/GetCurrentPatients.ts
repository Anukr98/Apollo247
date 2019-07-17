/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCurrentPatients
// ====================================================

export interface GetCurrentPatients_getCurrentPatients_patients {
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

export interface GetCurrentPatients_getCurrentPatients {
  __typename: "GetCurrentPatientsResult";
  patients: GetCurrentPatients_getCurrentPatients_patients[];
}

export interface GetCurrentPatients {
  getCurrentPatients: GetCurrentPatients_getCurrentPatients | null;
}
