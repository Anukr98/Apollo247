/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { AppointmentHistoryInput, APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAppointmentHistory
// ====================================================

export interface getAppointmentHistory_getAppointmentHistory_appointmentsHistory {
  __typename: "AppointmentHistory";
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: any;
  appointmentTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
}

export interface getAppointmentHistory_getAppointmentHistory {
  __typename: "AppointmentResult";
  appointmentsHistory: getAppointmentHistory_getAppointmentHistory_appointmentsHistory[] | null;
}

export interface getAppointmentHistory {
  getAppointmentHistory: getAppointmentHistory_getAppointmentHistory;
}

export interface getAppointmentHistoryVariables {
  appointmentHistoryInput?: AppointmentHistoryInput | null;
}
