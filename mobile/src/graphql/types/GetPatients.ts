/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Sex } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatients
// ====================================================

export interface GetPatients_getPatients_patients {
  __typename: "Patient";
  id: string;
  mobileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  sex: Sex | null;
}

export interface GetPatients_getPatients {
  __typename: "GetPatientsResult";
  patients: GetPatients_getPatients_patients[];
}

export interface GetPatients {
  getPatients: GetPatients_getPatients | null;
}
