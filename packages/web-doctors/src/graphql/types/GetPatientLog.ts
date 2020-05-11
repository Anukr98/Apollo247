/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { patientLogSort, patientLogType, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatientLog
// ====================================================

export interface GetPatientLog_getPatientLog_patientLog_patientInfo {
  __typename: "Patient";
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: any | null;
  id: string;
  emailAddress: string | null;
  mobileNumber: string;
  gender: Gender | null;
  uhid: string | null;
  photoUrl: string | null;
}

export interface GetPatientLog_getPatientLog_patientLog {
  __typename: "PatientLog";
  patientid: string | null;
  consultscount: string | null;
  appointmentids: (string | null)[] | null;
  appointmentdatetime: any | null;
  patientInfo: GetPatientLog_getPatientLog_patientLog_patientInfo | null;
}

export interface GetPatientLog_getPatientLog {
  __typename: "PatientLogData";
  patientLog: (GetPatientLog_getPatientLog_patientLog | null)[] | null;
  totalResultCount: number | null;
}

export interface GetPatientLog {
  getPatientLog: GetPatientLog_getPatientLog | null;
}

export interface GetPatientLogVariables {
  limit?: number | null;
  offset?: number | null;
  sortBy?: patientLogSort | null;
  type?: patientLogType | null;
  patientName?: string | null;
}
