/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, APPOINTMENT_STATE, Gender, DoctorType, MEDICINE_UNIT, MEDICINE_TIMINGS, MEDICINE_CONSUMPTION_DURATION } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAppointmentData
// ====================================================

export interface getAppointmentData_getAppointmentData_appointmentsHistory_patientInfo {
  __typename: "Patient";
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital_facility;
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  id: string;
  salutation: string | null;
  chatDays: number | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_specialty | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  doctorType: DoctorType;
  doctorHospital: getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo_doctorHospital[];
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory_appointmentPayments {
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

export interface getAppointmentData_getAppointmentData_appointmentsHistory_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  medicineName: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineDosage: string | null;
  medicineCustomDosage: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory_caseSheet {
  __typename: "CaseSheet";
  id: string | null;
  blobName: string | null;
  sentToPatient: boolean | null;
  version: number | null;
  followUpAfterInDays: string | null;
  doctorType: DoctorType | null;
  medicinePrescription: (getAppointmentData_getAppointmentData_appointmentsHistory_caseSheet_medicinePrescription | null)[] | null;
  diagnosticPrescription: (getAppointmentData_getAppointmentData_appointmentsHistory_caseSheet_diagnosticPrescription | null)[] | null;
}

export interface getAppointmentData_getAppointmentData_appointmentsHistory {
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
  isAutomatedQuestionsComplete: boolean | null;
  isSeniorConsultStarted: boolean | null;
  patientInfo: getAppointmentData_getAppointmentData_appointmentsHistory_patientInfo | null;
  doctorInfo: getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo | null;
  appointmentPayments: (getAppointmentData_getAppointmentData_appointmentsHistory_appointmentPayments | null)[] | null;
  caseSheet: (getAppointmentData_getAppointmentData_appointmentsHistory_caseSheet | null)[] | null;
}

export interface getAppointmentData_getAppointmentData {
  __typename: "DoctorAppointmentResult";
  appointmentsHistory: (getAppointmentData_getAppointmentData_appointmentsHistory | null)[] | null;
}

export interface getAppointmentData {
  getAppointmentData: getAppointmentData_getAppointmentData | null;
}

export interface getAppointmentDataVariables {
  appointmentId: string;
}
