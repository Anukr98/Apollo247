/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientAddressList
// ====================================================

export interface GetPatientAddressList_getPatientAddressList_addressList {
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
  updatedDate: any | null;
}

export interface GetPatientAddressList_getPatientAddressList {
  __typename: "patientAddressListResult";
  addressList: GetPatientAddressList_getPatientAddressList_addressList[] | null;
}

export interface GetPatientAddressList {
  getPatientAddressList: GetPatientAddressList_getPatientAddressList;
}

export interface GetPatientAddressListVariables {
  patientId: string;
}
