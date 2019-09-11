/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatients
// ====================================================

export interface GetPatients_getPatients_patients {
  __typename: "Patient";
  id: string;
  mobileNumber: string;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  gender: Gender | null;
  uhid: string | null;
  dateOfBirth: any | null;
}

export interface GetPatients_getPatients {
  __typename: "GetPatientsResult";
  patients: GetPatients_getPatients_patients[];
}

export interface GetPatients {
  getPatients: GetPatients_getPatients | null;
}
