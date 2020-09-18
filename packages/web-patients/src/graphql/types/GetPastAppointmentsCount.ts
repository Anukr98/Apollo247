/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPastAppointmentsCount
// ====================================================

export interface GetPastAppointmentsCount_getPastAppointmentsCount {
  __typename: "PastAppointmentsCountResult";
  count: number | null;
  completedCount: number | null;
  yesCount: number | null;
  noCount: number | null;
}

export interface GetPastAppointmentsCount {
  getPastAppointmentsCount: GetPastAppointmentsCount_getPastAppointmentsCount;
}

export interface GetPastAppointmentsCountVariables {
  doctorId: string;
  patientId: string;
  appointmentId: string;
}
