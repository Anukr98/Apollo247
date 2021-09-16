/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientProfileInput, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addNewProfile
// ====================================================

export interface addNewProfile_addNewProfile_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  mobileNumber: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  gender: Gender | null;
  dateOfBirth: any | null;
}

export interface addNewProfile_addNewProfile {
  __typename: "PatientInfo";
  patient: addNewProfile_addNewProfile_patient | null;
}

export interface addNewProfile {
  addNewProfile: addNewProfile_addNewProfile;
}

export interface addNewProfileVariables {
  PatientProfileInput: PatientProfileInput;
}
