/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { STATUS, APPOINTMENT_TYPE, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorAppointments
// ====================================================

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet {
  __typename: "CaseSheet";
  symptoms: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_symptoms | null)[] | null;
  status: string | null;
  doctorType: DoctorType | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo {
  __typename: "Patient";
  id: string;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory {
  __typename: "AppointmentHistory";
  id: string;
  patientId: string;
  appointmentDateTime: any;
  status: STATUS;
  bookingDate: any | null;
  appointmentType: APPOINTMENT_TYPE;
  caseSheet: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null)[] | null;
  patientInfo: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo | null;
}

export interface GetDoctorAppointments_getDoctorAppointments {
  __typename: "DoctorAppointmentResult";
  appointmentsHistory: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null)[] | null;
  newPatientsList: (string | null)[] | null;
}

export interface GetDoctorAppointments {
  getDoctorAppointments: GetDoctorAppointments_getDoctorAppointments | null;
}

export interface GetDoctorAppointmentsVariables {
  doctorId?: string | null;
  startDate: any;
  endDate: any;
}
