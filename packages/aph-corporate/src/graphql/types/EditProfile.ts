/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EditProfileInput, Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EditProfile
// ====================================================

export interface EditProfile_editProfile_patient {
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

export interface EditProfile_editProfile {
  __typename: "PatientInfo";
  patient: EditProfile_editProfile_patient | null;
}

export interface EditProfile {
  editProfile: EditProfile_editProfile;
}

export interface EditProfileVariables {
  editProfileInput: EditProfileInput;
}
