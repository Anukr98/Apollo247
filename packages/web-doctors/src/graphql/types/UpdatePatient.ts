/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdatePatientInput, Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePatient
// ====================================================

export interface UpdatePatient_updatePatient_patient {
  __typename: "Patient";
  id: string;
  mobileNumber: string;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  gender: Gender | null;
  uhid: string | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
}

export interface UpdatePatient_updatePatient {
  __typename: "UpdatePatientResult";
  patient: UpdatePatient_updatePatient_patient | null;
}

export interface UpdatePatient {
  updatePatient: UpdatePatient_updatePatient;
}

export interface UpdatePatientVariables {
  patientInput: UpdatePatientInput;
}
