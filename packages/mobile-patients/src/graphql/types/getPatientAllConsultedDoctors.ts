/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPatientAllConsultedDoctors
// ====================================================

export interface getPatientAllConsultedDoctors_getPatientAllAppointments_appointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  image: string | null;
  name: string;
}

export interface getPatientAllConsultedDoctors_getPatientAllAppointments_appointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  id: string;
  displayName: string | null;
  specialty: getPatientAllConsultedDoctors_getPatientAllAppointments_appointments_doctorInfo_specialty | null;
  photoUrl: string | null;
}

export interface getPatientAllConsultedDoctors_getPatientAllAppointments_appointments {
  __typename: "PatinetAppointments";
  doctorInfo: getPatientAllConsultedDoctors_getPatientAllAppointments_appointments_doctorInfo | null;
}

export interface getPatientAllConsultedDoctors_getPatientAllAppointments {
  __typename: "PatientAllAppointmentsResult";
  appointments: getPatientAllConsultedDoctors_getPatientAllAppointments_appointments[] | null;
}

export interface getPatientAllConsultedDoctors {
  getPatientAllAppointments: getPatientAllConsultedDoctors_getPatientAllAppointments;
}

export interface getPatientAllConsultedDoctorsVariables {
  patientId: string;
}
