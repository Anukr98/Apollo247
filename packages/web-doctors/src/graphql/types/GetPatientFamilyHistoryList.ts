/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientFamilyHistoryList
// ====================================================

export interface GetPatientFamilyHistoryList_getPatientFamilyHistoryList_familyHistoryList {
  __typename: "PatientFamilyHistoryDetails";
  id: string;
  description: string | null;
}

export interface GetPatientFamilyHistoryList_getPatientFamilyHistoryList {
  __typename: "PatientFamilyHistoryListResult";
  familyHistoryList: GetPatientFamilyHistoryList_getPatientFamilyHistoryList_familyHistoryList[] | null;
}

export interface GetPatientFamilyHistoryList {
  getPatientFamilyHistoryList: GetPatientFamilyHistoryList_getPatientFamilyHistoryList;
}

export interface GetPatientFamilyHistoryListVariables {
  patientId: string;
}
