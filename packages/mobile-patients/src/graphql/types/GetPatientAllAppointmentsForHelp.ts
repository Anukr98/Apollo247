/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatientAllAppointmentsForHelp
// ====================================================

export interface GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  city: string | null;
}

export interface GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo_doctorHospital_facility;
}

export interface GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  thumbnailUrl: string | null;
  displayName: string | null;
  experience: string | null;
  specialty: GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo_specialty | null;
  doctorHospital: GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo_doctorHospital[];
}

export interface GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments {
  __typename: "PatinetAppointments";
  actualAmount: number | null;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
  displayId: number | null;
  doctorInfo: GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments_doctorInfo | null;
}

export interface GetPatientAllAppointmentsForHelp_getPatientAllAppointments {
  __typename: "PatientAllAppointmentsResult";
  appointments: GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments[] | null;
}

export interface GetPatientAllAppointmentsForHelp {
  getPatientAllAppointments: GetPatientAllAppointmentsForHelp_getPatientAllAppointments;
}

export interface GetPatientAllAppointmentsForHelpVariables {
  patientId: string;
}
