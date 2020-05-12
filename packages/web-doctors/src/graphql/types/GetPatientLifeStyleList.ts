/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientLifeStyleList
// ====================================================

export interface GetPatientLifeStyleList_getPatientLifeStyleList_lifeStyleList {
  __typename: "PatientLifeStyles";
  id: string;
  description: string | null;
}

export interface GetPatientLifeStyleList_getPatientLifeStyleList {
  __typename: "PatientLifeStyleListResult";
  lifeStyleList: GetPatientLifeStyleList_getPatientLifeStyleList_lifeStyleList[] | null;
}

export interface GetPatientLifeStyleList {
  getPatientLifeStyleList: GetPatientLifeStyleList_getPatientLifeStyleList;
}

export interface GetPatientLifeStyleListVariables {
  patientId?: string | null;
}
