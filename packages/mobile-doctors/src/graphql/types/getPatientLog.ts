/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { patientLogSort, patientLogType, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientLog
// ====================================================

export interface getPatientLog_getPatientLog_patientLog_patientInfo_addressList {
  __typename: "PatientAddress";
  city: string | null;
}

export interface getPatientLog_getPatientLog_patientLog_patientInfo {
  __typename: "Patient";
  firstName: string | null;
  dateOfBirth: any | null;
  id: string;
  emailAddress: string | null;
  mobileNumber: string;
  gender: Gender | null;
  uhid: string | null;
  photoUrl: string | null;
  addressList: getPatientLog_getPatientLog_patientLog_patientInfo_addressList[] | null;
}

export interface getPatientLog_getPatientLog_patientLog {
  __typename: "PatientLog";
  patientid: string | null;
  consultscount: string | null;
  appointmentids: (string | null)[] | null;
  appointmentdatetime: any | null;
  patientInfo: getPatientLog_getPatientLog_patientLog_patientInfo | null;
}

export interface getPatientLog_getPatientLog {
  __typename: "PatientLogData";
  patientLog: (getPatientLog_getPatientLog_patientLog | null)[] | null;
  totalResultCount: number | null;
}

export interface getPatientLog {
  getPatientLog: getPatientLog_getPatientLog | null;
}

export interface getPatientLogVariables {
  limit?: number | null;
  offset?: number | null;
  sortBy?: patientLogSort | null;
  type?: patientLogType | null;
}
