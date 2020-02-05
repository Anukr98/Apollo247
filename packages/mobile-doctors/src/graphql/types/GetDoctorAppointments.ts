/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { STATUS, APPOINTMENT_TYPE, APPOINTMENT_STATE, DoctorType, Relation, Gender } from "./globalTypes";

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

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo_addressList {
  __typename: "PatientAddress";
  city: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo {
  __typename: "Patient";
  id: string;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  photoUrl: string | null;
  uhid: string | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  mobileNumber: string;
  gender: Gender | null;
  addressList: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo_addressList[] | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory {
  __typename: "AppointmentHistory";
  id: string;
  patientId: string;
  appointmentDateTime: any;
  status: STATUS;
  doctorId: string;
  bookingDate: any | null;
  appointmentType: APPOINTMENT_TYPE;
  appointmentState: APPOINTMENT_STATE | null;
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
  startDate?: any | null;
  endDate?: any | null;
}
