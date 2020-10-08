/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: makeAdressAsDefault
// ====================================================

export interface makeAdressAsDefault_makeAdressAsDefault_patientAddress {
  __typename: "PatientAddress";
  id: string;
  defaultAddress: boolean | null;
}

export interface makeAdressAsDefault_makeAdressAsDefault {
  __typename: "AddPatientAddressResult";
  patientAddress: makeAdressAsDefault_makeAdressAsDefault_patientAddress | null;
}

export interface makeAdressAsDefault {
  makeAdressAsDefault: makeAdressAsDefault_makeAdressAsDefault | null;
}

export interface makeAdressAsDefaultVariables {
  patientAddressId: string;
}
