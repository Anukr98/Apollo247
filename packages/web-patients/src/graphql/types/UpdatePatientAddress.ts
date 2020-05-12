/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdatePatientAddressInput, PATIENT_ADDRESS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePatientAddress
// ====================================================

export interface UpdatePatientAddress_updatePatientAddress_patientAddress {
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
}

export interface UpdatePatientAddress_updatePatientAddress {
  __typename: "AddPatientAddressResult";
  patientAddress: UpdatePatientAddress_updatePatientAddress_patientAddress | null;
}

export interface UpdatePatientAddress {
  updatePatientAddress: UpdatePatientAddress_updatePatientAddress | null;
}

export interface UpdatePatientAddressVariables {
  UpdatePatientAddressInput: UpdatePatientAddressInput;
}
