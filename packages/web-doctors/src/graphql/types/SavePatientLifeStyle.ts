/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientLifeStyleInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SavePatientLifeStyle
// ====================================================

export interface SavePatientLifeStyle_savePatientLifeStyle_patientLifeStyle {
  __typename: "PatientLifeStyles";
  id: string;
  description: string | null;
}

export interface SavePatientLifeStyle_savePatientLifeStyle {
  __typename: "AddPatientLifeStyleResult";
  patientLifeStyle: SavePatientLifeStyle_savePatientLifeStyle_patientLifeStyle | null;
}

export interface SavePatientLifeStyle {
  savePatientLifeStyle: SavePatientLifeStyle_savePatientLifeStyle;
}

export interface SavePatientLifeStyleVariables {
  patientLifeStyleInput?: PatientLifeStyleInput | null;
}
