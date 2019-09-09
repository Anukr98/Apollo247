/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GetDoctorConsultsInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorConsults
// ====================================================

export interface GetDoctorConsults_getDoctorConsults_doctorConsults_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
}

export interface GetDoctorConsults_getDoctorConsults_doctorConsults_appointment {
  __typename: "Appointment";
  appointmentDateTime: any | null;
}

export interface GetDoctorConsults_getDoctorConsults_doctorConsults {
  __typename: "DoctorConsult";
  patient: GetDoctorConsults_getDoctorConsults_doctorConsults_patient;
  appointment: GetDoctorConsults_getDoctorConsults_doctorConsults_appointment;
}

export interface GetDoctorConsults_getDoctorConsults {
  __typename: "GetDoctorConsultsResult";
  doctorConsults: GetDoctorConsults_getDoctorConsults_doctorConsults[];
}

export interface GetDoctorConsults {
  getDoctorConsults: GetDoctorConsults_getDoctorConsults;
}

export interface GetDoctorConsultsVariables {
  getDoctorConsultsInput: GetDoctorConsultsInput;
}
