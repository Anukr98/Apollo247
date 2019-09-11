/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Relation } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCurrentPatients
// ====================================================

export interface GetCurrentPatients_getCurrentPatients_patients {
  __typename: "Patient";
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  relation: Relation;
  uhid: string | null;
  emailAddress: string | null;
}

export interface GetCurrentPatients_getCurrentPatients {
  __typename: "GetCurrentPatientsResult";
  patients: GetCurrentPatients_getCurrentPatients_patients[];
}

export interface GetCurrentPatients {
  getCurrentPatients: GetCurrentPatients_getCurrentPatients | null;
}
