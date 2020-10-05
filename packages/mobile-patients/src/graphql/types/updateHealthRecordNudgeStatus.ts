/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateHealthRecordNudgeStatus
// ====================================================

export interface updateHealthRecordNudgeStatus_updateHealthRecordNudgeStatus {
  __typename: "healthRecordResult";
  response: string | null;
}

export interface updateHealthRecordNudgeStatus {
  updateHealthRecordNudgeStatus: updateHealthRecordNudgeStatus_updateHealthRecordNudgeStatus;
}

export interface updateHealthRecordNudgeStatusVariables {
  appointmentId: string;
  hideHealthRecordNudge?: boolean | null;
}
