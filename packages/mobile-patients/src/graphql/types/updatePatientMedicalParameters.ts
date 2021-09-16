/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientMedicalParameters, BloodGroups } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updatePatientMedicalParameters
// ====================================================

export interface updatePatientMedicalParameters_updatePatientMedicalParameters_patient_patientMedicalHistory {
  __typename: "MedicalHistory";
  bloodGroup: BloodGroups | null;
  height: string | null;
  weight: string | null;
}

export interface updatePatientMedicalParameters_updatePatientMedicalParameters_patient {
  __typename: "Patient";
  id: string;
  patientMedicalHistory: updatePatientMedicalParameters_updatePatientMedicalParameters_patient_patientMedicalHistory | null;
}

export interface updatePatientMedicalParameters_updatePatientMedicalParameters {
  __typename: "PatientInfo";
  patient: updatePatientMedicalParameters_updatePatientMedicalParameters_patient | null;
}

export interface updatePatientMedicalParameters {
  updatePatientMedicalParameters: updatePatientMedicalParameters_updatePatientMedicalParameters;
}

export interface updatePatientMedicalParametersVariables {
  patientMedicalParameters?: PatientMedicalParameters | null;
}
