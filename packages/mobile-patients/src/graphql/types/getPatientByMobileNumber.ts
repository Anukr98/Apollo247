/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Gender, Relation } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientByMobileNumber
// ====================================================

export interface getPatientByMobileNumber_getPatientByMobileNumber_patients {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string;
  dateOfBirth: any | null;
  emailAddress: string | null;
  gender: Gender | null;
  relation: Relation | null;
  photoUrl: string | null;
  athsToken: string | null;
  referralCode: string | null;
  isLinked: boolean | null;
  isUhidPrimary: boolean | null;
  primaryUhid: string | null;
  primaryPatientId: string | null;
  whatsAppMedicine: boolean | null;
  whatsAppConsult: boolean | null;
  partnerId: string | null;
}

export interface getPatientByMobileNumber_getPatientByMobileNumber {
  __typename: "PatientList";
  patients: (getPatientByMobileNumber_getPatientByMobileNumber_patients | null)[] | null;
}

export interface getPatientByMobileNumber {
  getPatientByMobileNumber: getPatientByMobileNumber_getPatientByMobileNumber | null;
}

export interface getPatientByMobileNumberVariables {
  mobileNumber?: string | null;
}
