/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FamilyHistoryParameters } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: savePatientFamilyHistoryToPRISM
// ====================================================

export interface savePatientFamilyHistoryToPRISM_savePatientFamilyHistoryToPRISM {
  __typename: "FamilyMedicalHistoryResult";
  status: boolean | null;
}

export interface savePatientFamilyHistoryToPRISM {
  savePatientFamilyHistoryToPRISM: savePatientFamilyHistoryToPRISM_savePatientFamilyHistoryToPRISM;
}

export interface savePatientFamilyHistoryToPRISMVariables {
  familyHistoryParameters?: FamilyHistoryParameters | null;
}
