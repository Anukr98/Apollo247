/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { STATUS, APPOINTMENT_TYPE } from './globalTypes';

// ====================================================
// GraphQL query operation: GetDoctorAppointments
// ====================================================

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory {
  __typename: 'AppointmentHistory';
  id: string;
  patientId: string;
  appointmentDateTime: any;
  status: STATUS;
  appointmentType: APPOINTMENT_TYPE;
}

export interface GetDoctorAppointments_getDoctorAppointments {
  __typename: 'AppointmentResult';
  appointmentsHistory: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory[] | null;
}

export interface GetDoctorAppointments {
  getDoctorAppointments: GetDoctorAppointments_getDoctorAppointments | null;
}

export interface GetDoctorAppointmentsVariables {
  doctorId: string;
  startDate: any;
  endDate: any;
}
