/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EditProfileInput, Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: editProfile
// ====================================================

export interface editProfile_editProfile_patient {
  __typename: "Patient";
  id: string;
  photoUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  gender: Gender | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
}

export interface editProfile_editProfile {
  __typename: "PatientInfo";
  patient: editProfile_editProfile_patient | null;
}

export interface editProfile {
  editProfile: editProfile_editProfile;
}

export interface editProfileVariables {
  editProfileInput: EditProfileInput;
}
