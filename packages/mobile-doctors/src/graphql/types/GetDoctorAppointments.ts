/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { STATUS, APPOINTMENT_TYPE, APPOINTMENT_STATE, DoctorType, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION, ROUTE_OF_ADMINISTRATION, Relation, Gender } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorAppointments
// ====================================================

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  id: string;
  displayName: string | null;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  doctorType: DoctorType;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_appointment {
  __typename: "Appointment";
  appointmentDateTime: any;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  externalId: string | null;
  medicineName: string | null;
  medicineDosage: string | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDuration: string | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
  routeOfAdministration: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage: string | null;
  medicineCustomDetails: string | null;
  includeGenericNameInPrescription: boolean | null;
  genericName: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_removedMedicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  externalId: string | null;
  medicineName: string | null;
  medicineDosage: string | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDuration: string | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
  routeOfAdministration: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage: string | null;
  medicineCustomDetails: string | null;
  includeGenericNameInPrescription: boolean | null;
  genericName: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet {
  __typename: "CaseSheet";
  id: string | null;
  blobName: string | null;
  doctorId: string | null;
  patientId: string | null;
  sentToPatient: boolean | null;
  status: string | null;
  referralSpecialtyName: string | null;
  referralDescription: string | null;
  appointment: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_appointment | null;
  medicinePrescription: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_medicinePrescription | null)[] | null;
  removedMedicinePrescription: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_removedMedicinePrescription | null)[] | null;
  otherInstructions: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_otherInstructions | null)[] | null;
  symptoms: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_symptoms | null)[] | null;
  diagnosis: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet_diagnosticPrescription | null)[] | null;
  followUp: boolean | null;
  followUpDate: any | null;
  followUpAfterInDays: string | null;
  doctorType: DoctorType | null;
  followUpConsultType: APPOINTMENT_TYPE | null;
  consultType: string | null;
  notes: string | null;
  updatedDate: any | null;
  isJdConsultStarted: boolean | null;
  version: number | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo_addressList {
  __typename: "PatientAddress";
  city: string | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo {
  __typename: "Patient";
  id: string;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  photoUrl: string | null;
  uhid: string | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  mobileNumber: string;
  gender: Gender | null;
  addressList: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo_addressList[] | null;
}

export interface GetDoctorAppointments_getDoctorAppointments_appointmentsHistory {
  __typename: "AppointmentHistory";
  id: string;
  patientId: string;
  appointmentDateTime: any;
  status: STATUS;
  doctorId: string;
  bookingDate: any | null;
  appointmentType: APPOINTMENT_TYPE;
  appointmentState: APPOINTMENT_STATE | null;
  displayId: number | null;
  isFollowUp: boolean | null;
  followUpParentId: string | null;
  isJdQuestionsComplete: boolean | null;
  doctorInfo: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_doctorInfo | null;
  caseSheet: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null)[] | null;
  patientInfo: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_patientInfo | null;
}

export interface GetDoctorAppointments_getDoctorAppointments {
  __typename: "DoctorAppointmentResult";
  appointmentsHistory: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null)[] | null;
  newPatientsList: (string | null)[] | null;
}

export interface GetDoctorAppointments {
  getDoctorAppointments: GetDoctorAppointments_getDoctorAppointments | null;
}

export interface GetDoctorAppointmentsVariables {
  startDate?: any | null;
  endDate?: any | null;
}
