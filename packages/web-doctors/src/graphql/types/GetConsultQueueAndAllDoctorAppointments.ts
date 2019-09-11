/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetConsultQueueAndAllDoctorAppointments
// ====================================================

export interface GetConsultQueueAndAllDoctorAppointments_getConsultQueue_consultQueue_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
}

export interface GetConsultQueueAndAllDoctorAppointments_getConsultQueue_consultQueue_appointment {
  __typename: "Appointment";
  id: string;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
}

export interface GetConsultQueueAndAllDoctorAppointments_getConsultQueue_consultQueue {
  __typename: "ConsultQueueItem";
  order: number;
  patient: GetConsultQueueAndAllDoctorAppointments_getConsultQueue_consultQueue_patient;
  appointment: GetConsultQueueAndAllDoctorAppointments_getConsultQueue_consultQueue_appointment;
}

export interface GetConsultQueueAndAllDoctorAppointments_getConsultQueue {
  __typename: "GetConsultQueueResult";
  consultQueue: GetConsultQueueAndAllDoctorAppointments_getConsultQueue_consultQueue[];
}

export interface GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments_appointmentsAndPatients_appointment {
  __typename: "Appointment";
  id: string;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
}

export interface GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments_appointmentsAndPatients_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
}

export interface GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments_appointmentsAndPatients {
  __typename: "AppointmentAndPatient";
  appointment: GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments_appointmentsAndPatients_appointment;
  patient: GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments_appointmentsAndPatients_patient;
}

export interface GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments {
  __typename: "GetAllDoctorAppointmentsResult";
  appointmentsAndPatients: GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments_appointmentsAndPatients[];
}

export interface GetConsultQueueAndAllDoctorAppointments {
  getConsultQueue: GetConsultQueueAndAllDoctorAppointments_getConsultQueue;
  getAllDoctorAppointments: GetConsultQueueAndAllDoctorAppointments_getAllDoctorAppointments;
}

export interface GetConsultQueueAndAllDoctorAppointmentsVariables {
  doctorId: string;
}
