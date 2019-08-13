/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { AppointmentHistoryInput, APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: AppointmentHistory
// ====================================================

export interface AppointmentHistory_getAppointmentHistory_appointmentsHistory {
  __typename: "AppointmentHistory";
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
}

export interface AppointmentHistory_getAppointmentHistory {
  __typename: "AppointmentResult";
  appointmentsHistory: AppointmentHistory_getAppointmentHistory_appointmentsHistory[] | null;
}

export interface AppointmentHistory {
  getAppointmentHistory: AppointmentHistory_getAppointmentHistory;
}

export interface AppointmentHistoryVariables {
  appointmentHistoryInput?: AppointmentHistoryInput | null;
}
