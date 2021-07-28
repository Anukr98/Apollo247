/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientAddressInput, PATIENT_ADDRESS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: savePatientAddress
// ====================================================

export interface savePatientAddress_savePatientAddress_patientAddress {
  __typename: "PatientAddress";
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  landmark: string | null;
  createdDate: any | null;
  updatedDate: any | null;
  addressType: PATIENT_ADDRESS_TYPE | null;
  otherAddressType: string | null;
  mobileNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  stateCode: string | null;
  name: string | null;
  defaultAddress: boolean | null;
}

export interface savePatientAddress_savePatientAddress {
  __typename: "AddPatientAddressResult";
  patientAddress: savePatientAddress_savePatientAddress_patientAddress | null;
}

export interface savePatientAddress {
  savePatientAddress: savePatientAddress_savePatientAddress;
}

export interface savePatientAddressVariables {
  PatientAddressInput: PatientAddressInput;
}
