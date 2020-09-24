/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientAddressInput, PATIENT_ADDRESS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SavePatientAddress
// ====================================================

export interface SavePatientAddress_savePatientAddress_patientAddress {
  __typename: "PatientAddress";
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  mobileNumber: string | null;
  state: string | null;
  zipcode: string | null;
  landmark: string | null;
  createdDate: any | null;
  addressType: PATIENT_ADDRESS_TYPE | null;
  otherAddressType: string | null;
  latitude: number | null;
  longitude: number | null;
  stateCode: string | null;
  name: string | null;
}

export interface SavePatientAddress_savePatientAddress {
  __typename: "AddPatientAddressResult";
  patientAddress: SavePatientAddress_savePatientAddress_patientAddress | null;
}

export interface SavePatientAddress {
  savePatientAddress: SavePatientAddress_savePatientAddress;
}

export interface SavePatientAddressVariables {
  patientAddress?: PatientAddressInput | null;
}
