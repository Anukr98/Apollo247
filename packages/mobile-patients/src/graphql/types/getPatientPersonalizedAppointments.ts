/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientPersonalizedAppointments
// ====================================================

export interface getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails_doctorDetails_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
}

export interface getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails_doctorDetails {
  __typename: "DoctorDetailsWithStatusExclude";
  id: string;
  firstName: string;
  experience: string | null;
  photoUrl: string | null;
  displayName: string | null;
  specialty: getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails_doctorDetails_specialty | null;
}

export interface getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails {
  __typename: "PersonalizedAppointment";
  id: string | null;
  hospitalLocation: string | null;
  appointmentDateTime: any | null;
  appointmentType: APPOINTMENT_TYPE | null;
  doctorId: string | null;
  doctorDetails: getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails_doctorDetails | null;
}

export interface getPatientPersonalizedAppointments_getPatientPersonalizedAppointments {
  __typename: "PersonalizedAppointmentResult";
  appointmentDetails: getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails | null;
}

export interface getPatientPersonalizedAppointments {
  getPatientPersonalizedAppointments: getPatientPersonalizedAppointments_getPatientPersonalizedAppointments;
}

export interface getPatientPersonalizedAppointmentsVariables {
  patientUhid: string;
}
