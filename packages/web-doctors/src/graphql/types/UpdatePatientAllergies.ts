/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdatePatientAllergies
// ====================================================

export interface UpdatePatientAllergies_updatePatientAllergies_patient {
  __typename: "Patient";
  id: string;
  allergies: string | null;
}

export interface UpdatePatientAllergies_updatePatientAllergies {
  __typename: "UpdatePatientResult";
  patient: UpdatePatientAllergies_updatePatientAllergies_patient | null;
}

export interface UpdatePatientAllergies {
  updatePatientAllergies: UpdatePatientAllergies_updatePatientAllergies;
}

export interface UpdatePatientAllergiesVariables {
  patientId: string;
  allergies: string;
}
