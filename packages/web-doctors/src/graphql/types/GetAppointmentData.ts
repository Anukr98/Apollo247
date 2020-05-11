/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAppointmentData
// ====================================================

export interface GetAppointmentData_getAppointmentData_appointmentsHistory {
  __typename: "AppointmentHistory";
  appointmentDateTime: any;
  id: string;
}

export interface GetAppointmentData_getAppointmentData {
  __typename: "DoctorAppointmentResult";
  appointmentsHistory: (GetAppointmentData_getAppointmentData_appointmentsHistory | null)[] | null;
}

export interface GetAppointmentData {
  getAppointmentData: GetAppointmentData_getAppointmentData | null;
}

export interface GetAppointmentDataVariables {
  appointmentId: string;
}
