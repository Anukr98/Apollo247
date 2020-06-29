/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RemoveDelegateNumber
// ====================================================

export interface RemoveDelegateNumber_removeDelegateNumber_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  createdDate: string | null;
  image: string | null;
}

export interface RemoveDelegateNumber_removeDelegateNumber {
  __typename: "Profile";
  city: string | null;
  country: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firstName: string | null;
  gender: Gender | null;
  id: string;
  lastName: string | null;
  mobileNumber: string;
  photoUrl: string | null;
  qualification: string | null;
  salutation: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zip: string | null;
  specialty: RemoveDelegateNumber_removeDelegateNumber_specialty;
}

export interface RemoveDelegateNumber {
  removeDelegateNumber: RemoveDelegateNumber_removeDelegateNumber | null;
}
