/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdatePatientInput, Relation, Sex, ErrorMsgs } from './globalTypes';

// ====================================================
// GraphQL mutation operation: updatePatient
// ====================================================

export interface updatePatient_updatePatient_patient {
  __typename: 'Patient';
  id: string;
  mobileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  sex: Sex | null;
  uhid: string | null;
  dateOfBirth: string | null;
  emailAddress: string | null;
}

export interface updatePatient_updatePatient_errors {
  __typename: 'Error';
  messages: ErrorMsgs[];
}

export interface updatePatient_updatePatient {
  __typename: 'UpdatePatientResult';
  patient: updatePatient_updatePatient_patient | null;
  errors: updatePatient_updatePatient_errors | null;
}

export interface updatePatient {
  updatePatient: updatePatient_updatePatient;
}

export interface updatePatientVariables {
  patientInput: UpdatePatientInput;
}
