/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientFamilyHistoryInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SavePatientFamilyHistory
// ====================================================

export interface SavePatientFamilyHistory_savePatientFamilyHistory_patientFamilyHistory {
  __typename: "PatientFamilyHistoryDetails";
  id: string;
  description: string | null;
}

export interface SavePatientFamilyHistory_savePatientFamilyHistory {
  __typename: "AddPatientFamilyHistoryResult";
  patientFamilyHistory: SavePatientFamilyHistory_savePatientFamilyHistory_patientFamilyHistory | null;
}

export interface SavePatientFamilyHistory {
  savePatientFamilyHistory: SavePatientFamilyHistory_savePatientFamilyHistory;
}

export interface SavePatientFamilyHistoryVariables {
  patientFamilyHistoryInput?: PatientFamilyHistoryInput | null;
}
