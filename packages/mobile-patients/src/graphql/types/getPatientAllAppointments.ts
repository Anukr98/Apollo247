/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, APPOINTMENT_STATE, STATUS, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientAllAppointments
// ====================================================

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_appointmentPayments {
  __typename: "AppointmentPayment";
  amountPaid: number;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet {
  __typename: "CaseSheet";
  doctorType: DoctorType | null;
  version: number | null;
  followUpAfterInDays: string | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet_medicinePrescription | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  city: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  fullName: string | null;
  doctorType: DoctorType;
  city: string | null;
  id: string;
  thumbnailUrl: string | null;
  displayName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_specialty | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital[];
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments {
  __typename: "PatinetAppointments";
  id: string;
  patientId: string;
  doctorId: string;
  actualAmount: number | null;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
  appointmentState: APPOINTMENT_STATE | null;
  status: STATUS;
  isConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isFollowUp: string;
  displayId: number | null;
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_appointmentPayments | null)[] | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet | null)[] | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_appointmentPayments {
  __typename: "AppointmentPayment";
  amountPaid: number;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet {
  __typename: "CaseSheet";
  doctorType: DoctorType | null;
  version: number | null;
  followUpAfterInDays: string | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet_medicinePrescription | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  city: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  fullName: string | null;
  doctorType: DoctorType;
  city: string | null;
  id: string;
  thumbnailUrl: string | null;
  displayName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_specialty | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital[];
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments {
  __typename: "PatinetAppointments";
  id: string;
  patientId: string;
  doctorId: string;
  actualAmount: number | null;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
  appointmentState: APPOINTMENT_STATE | null;
  status: STATUS;
  isConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isFollowUp: string;
  displayId: number | null;
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_appointmentPayments | null)[] | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet | null)[] | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_appointmentPayments {
  __typename: "AppointmentPayment";
  amountPaid: number;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet {
  __typename: "CaseSheet";
  doctorType: DoctorType | null;
  version: number | null;
  followUpAfterInDays: string | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  city: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  fullName: string | null;
  doctorType: DoctorType;
  city: string | null;
  id: string;
  thumbnailUrl: string | null;
  displayName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_specialty | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_doctorHospital[];
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments {
  __typename: "PatinetAppointments";
  id: string;
  patientId: string;
  doctorId: string;
  actualAmount: number | null;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
  appointmentState: APPOINTMENT_STATE | null;
  status: STATUS;
  isConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isFollowUp: string;
  displayId: number | null;
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_appointmentPayments | null)[] | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet | null)[] | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_appointmentPayments {
  __typename: "AppointmentPayment";
  amountPaid: number;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_caseSheet {
  __typename: "CaseSheet";
  doctorType: DoctorType | null;
  version: number | null;
  followUpAfterInDays: string | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_completedAppointments_caseSheet_medicinePrescription | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  city: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  fullName: string | null;
  doctorType: DoctorType;
  city: string | null;
  id: string;
  thumbnailUrl: string | null;
  displayName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_specialty | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorHospital[];
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments {
  __typename: "PatinetAppointments";
  id: string;
  patientId: string;
  doctorId: string;
  actualAmount: number | null;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
  appointmentState: APPOINTMENT_STATE | null;
  status: STATUS;
  isConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isFollowUp: string;
  displayId: number | null;
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_completedAppointments_appointmentPayments | null)[] | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_completedAppointments_caseSheet | null)[] | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments {
  __typename: "PatientAllAppointmentsResult";
  cancelledAppointments: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments[] | null;
  followUpAppointments: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments[] | null;
  activeAppointments: getPatientAllAppointments_getPatientAllAppointments_activeAppointments[] | null;
  completedAppointments: getPatientAllAppointments_getPatientAllAppointments_completedAppointments[] | null;
}

export interface getPatientAllAppointments {
  getPatientAllAppointments: getPatientAllAppointments_getPatientAllAppointments;
}

export interface getPatientAllAppointmentsVariables {
  patientId: string;
}
