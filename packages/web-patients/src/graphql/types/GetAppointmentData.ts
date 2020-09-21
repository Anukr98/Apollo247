/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, APPOINTMENT_STATE, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAppointmentData
// ====================================================

export interface GetAppointmentData_getAppointmentData_appointmentsHistory_caseSheet {
  __typename: "CaseSheet";
  followUpAfterInDays: string | null;
  doctorType: DoctorType | null;
}

export interface GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  name: string;
  id: string;
}

export interface GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital_facility;
}

export interface GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  mobileNumber: string;
  id: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_specialty | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  doctorType: DoctorType;
  doctorHospital: GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital[];
}

export interface GetAppointmentData_getAppointmentData_appointmentsHistory {
  __typename: "AppointmentHistory";
  appointmentType: APPOINTMENT_TYPE;
  id: string;
  patientId: string;
  appointmentDateTime: any;
  status: STATUS;
  hospitalId: string | null;
  doctorId: string;
  isFollowUp: boolean | null;
  displayId: number | null;
  rescheduleCount: number | null;
  appointmentState: APPOINTMENT_STATE | null;
  isJdQuestionsComplete: boolean | null;
  isSeniorConsultStarted: boolean | null;
  isConsultStarted: boolean | null;
  symptoms: string | null;
  caseSheet: (GetAppointmentData_getAppointmentData_appointmentsHistory_caseSheet | null)[] | null;
  doctorInfo: GetAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo | null;
}

export interface GetAppointmentData_getAppointmentData {
  __typename: "DoctorAppointmentResult";
  appointmentsHistory: (GetAppointmentData_getAppointmentData_appointmentsHistory | null)[] | null;
}

export interface GetAppointmentData {
  getAppointmentData: GetAppointmentData_getAppointmentData | null;
}

export interface GetAppointmentDataVariables {
  appointmentId: string;
}
