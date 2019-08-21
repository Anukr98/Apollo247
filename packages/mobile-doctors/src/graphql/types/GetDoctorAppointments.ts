/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, Gender, Relation } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorAppointments
// ====================================================

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo {
  __typename: "Patient";
  firstName: string | null;
  lastName: string | null;
  id: string;
  uhid: string | null;
  emailAddress: string | null;
  gender: Gender | null;
  dateOfBirth: any | null;
  relation: Relation | null;
}

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
  patientInfo: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo | null;
}

export interface GetDoctorAppointments_getDoctorAppointments {
  __typename: "DoctorAppointmentResult";
  newPatientsList: (string | null)[] | null;
  appointmentsHistory: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null)[] | null;
}

export interface GetDoctorAppointments {
  getDoctorAppointments: GetDoctorAppointments_getDoctorAppointments | null;
}

export interface GetDoctorAppointmentsVariables {
  startDate?: any | null;
  endDate?: any | null;
}
