/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PATIENT_ADDRESS_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientAddressList
// ====================================================

export interface getPatientAddressList_getPatientAddressList_addressList {
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
  defaultAddress: boolean | null;
}

export interface getPatientAddressList_getPatientAddressList {
  __typename: "patientAddressListResult";
  addressList: getPatientAddressList_getPatientAddressList_addressList[] | null;
}

export interface getPatientAddressList {
  getPatientAddressList: getPatientAddressList_getPatientAddressList;
}

export interface getPatientAddressListVariables {
  patientId?: string | null;
}
