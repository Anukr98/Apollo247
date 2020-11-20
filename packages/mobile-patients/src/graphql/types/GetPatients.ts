/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PATIENT_ADDRESS_TYPE, Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatients
// ====================================================

export interface getPatients_getPatients_patients_addressList {
  __typename: "PatientAddress";
  id: string;
  addressType: PATIENT_ADDRESS_TYPE | null;
  addressLine1: string | null;
  addressLine2: string | null;
  state: string | null;
  landmark: string | null;
  createdDate: any | null;
  updatedDate: any | null;
  mobileNumber: string | null;
  city: string | null;
  otherAddressType: string | null;
}

export interface getPatients_getPatients_patients {
  __typename: "Patient";
  addressList: getPatients_getPatients_patients_addressList[] | null;
  id: string;
  mobileNumber: string;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  uhid: string | null;
  gender: Gender | null;
  emailAddress: string | null;
  dateOfBirth: any | null;
}

export interface getPatients_getPatients {
  __typename: "GetPatientsResult";
  patients: getPatients_getPatients_patients[];
}

export interface getPatients {
  getPatients: getPatients_getPatients | null;
}
