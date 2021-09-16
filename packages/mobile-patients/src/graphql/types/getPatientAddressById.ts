/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPatientAddressById
// ====================================================

export interface getPatientAddressById_getPatientAddressById_patientAddress {
  __typename: "PatientAddress";
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  landmark: string | null;
  mobileNumber: string | null;
  name: string | null;
}

export interface getPatientAddressById_getPatientAddressById {
  __typename: "AddPatientAddressResult";
  patientAddress: getPatientAddressById_getPatientAddressById_patientAddress | null;
}

export interface getPatientAddressById {
  getPatientAddressById: getPatientAddressById_getPatientAddressById;
}

export interface getPatientAddressByIdVariables {
  id?: string | null;
}
