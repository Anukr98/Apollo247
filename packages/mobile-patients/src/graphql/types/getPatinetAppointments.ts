/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientAppointmentsInput, APPOINTMENT_TYPE, STATUS, APPOINTMENT_STATE, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatinetAppointments
// ====================================================

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments_appointmentPayments {
  __typename: "AppointmentPayment";
  id: string;
  amountPaid: number;
  paymentRefId: string | null;
  paymentStatus: string;
  paymentDateTime: any;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
}

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
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
  __typename: "DoctorDetailsWithStatusExclude";
  id: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty | null;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  doctorType: DoctorType;
  doctorHospital: getPatinetAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital[];
}

export interface getPatinetAppointments_getPatinetAppointments_patinetAppointments {
  __typename: "PatinetAppointments";
  appointmentPayments: (getPatinetAppointments_getPatinetAppointments_patinetAppointments_appointmentPayments | null)[] | null;
  appointmentType: APPOINTMENT_TYPE;
  id: string;
  patientId: string;
  appointmentDateTime: any;
  status: STATUS;
  hospitalId: string | null;
  doctorId: string;
  displayId: number | null;
  isFollowUp: string;
  rescheduleCount: number | null;
  appointmentState: APPOINTMENT_STATE | null;
  isConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isSeniorConsultStarted: boolean | null;
  symptoms: string | null;
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
