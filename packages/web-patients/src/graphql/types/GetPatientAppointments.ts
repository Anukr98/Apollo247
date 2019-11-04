/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PatientAppointmentsInput, APPOINTMENT_TYPE, STATUS, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatientAppointments
// ====================================================

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  name: string;
  id: string;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo {
  __typename: "DoctorDetails";
  id: string;
  firstName: string;
  lastName: string;
  doctorType: DoctorType;
  experience: string | null;
  isActive: boolean;
  photoUrl: string | null;
  qualification: string | null;
  specialization: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  specialty: GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty | null;
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
