/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientFutureAppointmentCount
// ====================================================

export interface GetPatientFutureAppointmentCount_getPatientFutureAppointmentCount {
  __typename: "AppointmentsCount";
  consultsCount: number | null;
}

export interface GetPatientFutureAppointmentCount {
  getPatientFutureAppointmentCount: GetPatientFutureAppointmentCount_getPatientFutureAppointmentCount | null;
}

export interface GetPatientFutureAppointmentCountVariables {
  patientId?: string | null;
}
