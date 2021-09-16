/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPastAppointmentsCount
// ====================================================

export interface getPastAppointmentsCount_getPastAppointmentsCount {
  __typename: "PastAppointmentsCountResult";
  count: number | null;
  completedCount: number | null;
  yesCount: number | null;
  noCount: number | null;
}

export interface getPastAppointmentsCount {
  getPastAppointmentsCount: getPastAppointmentsCount_getPastAppointmentsCount;
}

export interface getPastAppointmentsCountVariables {
  doctorId: string;
  patientId: string;
  appointmentId: string;
}
