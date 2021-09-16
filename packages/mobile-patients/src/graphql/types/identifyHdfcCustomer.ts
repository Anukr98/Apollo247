/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { HDFC_CUSTOMER } from "./globalTypes";

// ====================================================
// GraphQL query operation: identifyHdfcCustomer
// ====================================================

export interface identifyHdfcCustomer_identifyHdfcCustomer {
  __typename: "identifyHdfcCustomerResponse";
  status: HDFC_CUSTOMER;
  token: string | null;
}

export interface identifyHdfcCustomer {
  identifyHdfcCustomer: identifyHdfcCustomer_identifyHdfcCustomer | null;
}

export interface identifyHdfcCustomerVariables {
  mobileNumber: string;
  DOB: any;
}
