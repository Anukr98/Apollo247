/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getSecretaryDetailsByDoctorId
// ====================================================

export interface getSecretaryDetailsByDoctorId_getSecretaryDetailsByDoctorId {
  __typename: "SecretaryDetails";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface getSecretaryDetailsByDoctorId {
  getSecretaryDetailsByDoctorId: getSecretaryDetailsByDoctorId_getSecretaryDetailsByDoctorId | null;
}

export interface getSecretaryDetailsByDoctorIdVariables {
  doctorId: string;
}
