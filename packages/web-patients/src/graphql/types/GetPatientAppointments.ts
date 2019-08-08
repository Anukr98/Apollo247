/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PatientAppointmentsInput, APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatientAppointments
// ====================================================

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo {
  __typename: "DoctorDetails";
  id: string;
  firstName: string;
  lastName: string;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments {
  __typename: "PatinetAppointments";
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
  doctorInfo: GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo | null;
}

export interface GetPatientAppointments_getPatinetAppointments {
  __typename: "PatientAppointmentsResult";
  patinetAppointments: GetPatientAppointments_getPatinetAppointments_patinetAppointments[] | null;
}

export interface GetPatientAppointments {
  getPatinetAppointments: GetPatientAppointments_getPatinetAppointments;
}

export interface GetPatientAppointmentsVariables {
  patientAppointmentsInput?: PatientAppointmentsInput | null;
}
