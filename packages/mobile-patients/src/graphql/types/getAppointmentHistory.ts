/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AppointmentHistoryInput, APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAppointmentHistory
// ====================================================

export interface getAppointmentHistory_getAppointmentHistory_appointmentsHistory_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  details: string | null;
}

export interface getAppointmentHistory_getAppointmentHistory_appointmentsHistory_caseSheet {
  __typename: "CaseSheet";
  symptoms: (getAppointmentHistory_getAppointmentHistory_appointmentsHistory_caseSheet_symptoms | null)[] | null;
}

export interface getAppointmentHistory_getAppointmentHistory_appointmentsHistory {
  __typename: "AppointmentHistory";
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
  isSeniorConsultStarted: boolean | null;
  caseSheet: (getAppointmentHistory_getAppointmentHistory_appointmentsHistory_caseSheet | null)[] | null;
}

export interface getAppointmentHistory_getAppointmentHistory {
  __typename: "AppointmentResult";
  appointmentsHistory: getAppointmentHistory_getAppointmentHistory_appointmentsHistory[] | null;
}

export interface getAppointmentHistory {
  getAppointmentHistory: getAppointmentHistory_getAppointmentHistory;
}

export interface getAppointmentHistoryVariables {
  appointmentHistoryInput?: AppointmentHistoryInput | null;
}
