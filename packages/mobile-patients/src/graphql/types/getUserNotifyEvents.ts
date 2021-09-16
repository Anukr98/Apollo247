/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getUserNotifyEvents
// ====================================================

export interface getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount {
  __typename: "phrNotifyEventsNewRecordsCountResult";
  LabTest: number | null;
  Allergy: number | null;
  Bill: number | null;
  HealthCheck: number | null;
  Hospitalization: number | null;
  Insurance: number | null;
  MedicalCondition: number | null;
  Medication: number | null;
  Prescription: number | null;
  Restriction: number | null;
}

export interface getUserNotifyEvents_getUserNotifyEvents_phr {
  __typename: "phrNotifyEventsResult";
  newRecordsCount: getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount | null;
}

export interface getUserNotifyEvents_getUserNotifyEvents {
  __typename: "userNotifyEventsResult";
  phr: getUserNotifyEvents_getUserNotifyEvents_phr | null;
}

export interface getUserNotifyEvents {
  getUserNotifyEvents: getUserNotifyEvents_getUserNotifyEvents | null;
}

export interface getUserNotifyEventsVariables {
  patientId: string;
}
