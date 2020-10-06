/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientProfileInput, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AddNewProfile
// ====================================================

export interface AddNewProfile_addNewProfile_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  mobileNumber: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  gender: Gender | null;
}

export interface AddNewProfile_addNewProfile {
  __typename: "PatientInfo";
  patient: AddNewProfile_addNewProfile_patient | null;
}

export interface AddNewProfile {
  addNewProfile: AddNewProfile_addNewProfile;
}

export interface AddNewProfileVariables {
  PatientProfileInput: PatientProfileInput;
}
