/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PatientAppointmentsInput, APPOINTMENT_TYPE, STATUS, Salutation, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatinetAppointments
// ====================================================

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  experience: string | null;
  specialty: getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
  doctorType: DoctorType;
  doctorHospital: getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital[];
}

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments {
  __typename: "PatinetAppointments";
  appointmentType: APPOINTMENT_TYPE;
  id: string;
  patientId: string;
  appointmentDateTime: any;
  status: STATUS;
  hospitalId: string | null;
  doctorId: string;
  isFollowUp: string;
  rescheduleCount: number | null;
  doctorInfo: getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo | null;
}

export interface getPatinetAppointments_getPatinetAppointments {
  __typename: "PatientAppointmentsResult";
  patinetAppointments: getPatinetAppointments_getPatinetAppointments_patinetAppointments[] | null;
}

export interface getPatinetAppointments {
  getPatinetAppointments: getPatinetAppointments_getPatinetAppointments;
}

export interface getPatinetAppointmentsVariables {
  patientAppointmentsInput: PatientAppointmentsInput;
}
