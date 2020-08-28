/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdatePatientAddressInput, PATIENT_ADDRESS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updatePatientAddress
// ====================================================

export interface updatePatientAddress_updatePatientAddress_patientAddress {
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
  latitude: number | null;
  longitude: number | null;
  stateCode: string | null;
  mobileNumber: string | null;
  name: string | null;
}

export interface updatePatientAddress_updatePatientAddress {
  __typename: "AddPatientAddressResult";
  patientAddress: updatePatientAddress_updatePatientAddress_patientAddress | null;
}

export interface updatePatientAddress {
  updatePatientAddress: updatePatientAddress_updatePatientAddress | null;
}

export interface updatePatientAddressVariables {
  UpdatePatientAddressInput: UpdatePatientAddressInput;
}
