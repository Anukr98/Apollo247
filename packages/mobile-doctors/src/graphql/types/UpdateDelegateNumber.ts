/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateDelegateNumber
// ====================================================

export interface UpdateDelegateNumber_updateDelegateNumber_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  createdDate: string | null;
  image: string | null;
}

export interface UpdateDelegateNumber_updateDelegateNumber {
  __typename: "Profile";
  city: string | null;
  country: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firstName: string | null;
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
  specialty: UpdateDelegateNumber_updateDelegateNumber_specialty;
}

export interface UpdateDelegateNumber {
  updateDelegateNumber: UpdateDelegateNumber_updateDelegateNumber | null;
}

export interface UpdateDelegateNumberVariables {
  delegateNumber: string;
}
