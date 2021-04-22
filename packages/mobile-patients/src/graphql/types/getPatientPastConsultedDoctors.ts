/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPatientPastConsultedDoctors
// ====================================================

export interface getPatientPastConsultedDoctors_getPatientPastConsultedDoctors_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface getPatientPastConsultedDoctors_getPatientPastConsultedDoctors_consultDetails {
  __typename: "DoctorIdAndConsultDetails";
  consultDateTime: any | null;
  displayId: string | null;
  appointmentId: string | null;
  hospitalId: string | null;
  hospitalName: string | null;
  consultMode: string | null;
  _247_Flag: boolean | null;
}

export interface getPatientPastConsultedDoctors_getPatientPastConsultedDoctors {
  __typename: "Profile";
  id: string;
  fullName: string | null;
  thumbnailUrl: string | null;
  specialty: getPatientPastConsultedDoctors_getPatientPastConsultedDoctors_specialty;
  consultDetails: getPatientPastConsultedDoctors_getPatientPastConsultedDoctors_consultDetails | null;
}

export interface getPatientPastConsultedDoctors {
  getPatientPastConsultedDoctors: (getPatientPastConsultedDoctors_getPatientPastConsultedDoctors | null)[];
}

export interface getPatientPastConsultedDoctorsVariables {
  patientMobile?: string | null;
  offset?: number | null;
  limit?: number | null;
}
