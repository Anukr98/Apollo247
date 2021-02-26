/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPincodeServiceability
// ====================================================

export interface getPincodeServiceability_getPincodeServiceability {
  __typename: "GetPincodeServiceabilityResponse";
  cityID: number | null;
  cityName: string | null;
  stateID: number | null;
  stateName: string | null;
  areaSelectionEnabled: boolean | null;
}

export interface getPincodeServiceability {
  getPincodeServiceability: getPincodeServiceability_getPincodeServiceability;
}

export interface getPincodeServiceabilityVariables {
  pincode: number;
}
