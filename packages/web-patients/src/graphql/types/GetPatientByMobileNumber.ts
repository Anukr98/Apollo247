/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatientByMobileNumber
// ====================================================

export interface GetPatientByMobileNumber_getPatientByMobileNumber_patients {
  __typename: "Patient";
  id: string;
  mobileNumber: string;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  gender: Gender | null;
  uhid: string | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  photoUrl: string | null;
  referralCode: string | null;
}

export interface GetPatientByMobileNumber_getPatientByMobileNumber {
  __typename: "PatientList";
  patients: (GetPatientByMobileNumber_getPatientByMobileNumber_patients | null)[] | null;
}

export interface GetPatientByMobileNumber {
  getPatientByMobileNumber: GetPatientByMobileNumber_getPatientByMobileNumber | null;
}

export interface GetPatientByMobileNumberVariables {
  mobileNumber?: string | null;
}
