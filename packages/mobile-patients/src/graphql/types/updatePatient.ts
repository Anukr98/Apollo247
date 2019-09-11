/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdatePatientInput, Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updatePatient
// ====================================================

export interface updatePatient_updatePatient_patient {
  __typename: "Patient";
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  relation: Relation;
  gender: Gender;
  uhid: string | null;
  dateOfBirth: any;
  emailAddress: string | null;
}

export interface updatePatient_updatePatient {
  __typename: "UpdatePatientResult";
  patient: updatePatient_updatePatient_patient | null;
}

export interface updatePatient {
  updatePatient: updatePatient_updatePatient;
}

export interface updatePatientVariables {
  patientInput: UpdatePatientInput;
}
