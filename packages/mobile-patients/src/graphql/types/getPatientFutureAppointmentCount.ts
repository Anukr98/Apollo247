/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPatientFutureAppointmentCount
// ====================================================

export interface getPatientFutureAppointmentCount_getPatientFutureAppointmentCount {
  __typename: "AppointmentsCount";
  activeConsultsCount: number | null;
  upcomingConsultsCount: number | null;
  upcomingPhysicalConsultsCount: number | null;
}

export interface getPatientFutureAppointmentCount {
  getPatientFutureAppointmentCount: getPatientFutureAppointmentCount_getPatientFutureAppointmentCount | null;
}

export interface getPatientFutureAppointmentCountVariables {
  patientId?: string | null;
}
