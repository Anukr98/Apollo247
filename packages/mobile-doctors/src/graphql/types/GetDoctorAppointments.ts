/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorAppointments
// ====================================================

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory {
  __typename: "AppointmentHistory";
  appointmentType: APPOINTMENT_TYPE;
  doctorId: string;
  status: STATUS;
  hospitalId: string | null;
  id: string;
  patientId: string;
  appointmentDateTime: any;
  bookingDate: any | null;
}

export interface GetDoctorAppointments_getDoctorAppointments {
  __typename: "AppointmentResult";
  appointmentsHistory: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory[] | null;
}

export interface GetDoctorAppointments {
  getDoctorAppointments: GetDoctorAppointments_getDoctorAppointments | null;
}

export interface GetDoctorAppointmentsVariables {
  doctorId?: string | null;
  startDate?: any | null;
  endDate?: any | null;
}
