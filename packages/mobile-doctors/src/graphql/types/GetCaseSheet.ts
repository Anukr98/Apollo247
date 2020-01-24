/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Gender, Relation, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS, STATUS, Salutation, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCaseSheet
// ====================================================

export interface GetCaseSheet_getCaseSheet_patientDetails_lifeStyle {
  __typename: "PatientLifeStyle";
  description: string | null;
}

export interface GetCaseSheet_getCaseSheet_patientDetails_familyHistory {
  __typename: "PatientFamilyHistory";
  description: string | null;
  relation: string | null;
}

export interface GetCaseSheet_getCaseSheet_patientDetails_healthVault {
  __typename: "PatientHealthVault";
  imageUrls: string | null;
  reportUrls: string | null;
}

export interface GetCaseSheet_getCaseSheet_patientDetails {
  __typename: "PatientDetails";
  id: string;
  allergies: string | null;
  lifeStyle: (GetCaseSheet_getCaseSheet_patientDetails_lifeStyle | null)[] | null;
  familyHistory: (GetCaseSheet_getCaseSheet_patientDetails_familyHistory | null)[] | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  mobileNumber: string | null;
  uhid: string | null;
  photoUrl: string | null;
  relation: Relation | null;
  healthVault: (GetCaseSheet_getCaseSheet_patientDetails_healthVault | null)[] | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  medicineName: string | null;
  medicineDosage: string | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineConsumptionDurationInDays: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails {
  __typename: "CaseSheet";
  id: string | null;
  medicinePrescription: (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null;
  otherInstructions: (GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions | null)[] | null;
  symptoms: (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null;
  diagnosis: (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
  diagnosticPrescription: (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription | null)[] | null;
  followUp: boolean | null;
  followUpDate: any | null;
  followUpAfterInDays: string | null;
  consultType: string | null;
  notes: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_doctorInfo {
  __typename: "Profile";
  firstName: string | null;
  lastName: string | null;
  salutation: Salutation | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_appointment {
  __typename: "Appointment";
  id: string;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_createdDoctorProfile {
  __typename: "Profile";
  firstName: string | null;
  lastName: string | null;
  salutation: Salutation | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineName: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineInstructions: string | null;
  medicineConsumptionDurationInDays: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet {
  __typename: "CaseSheet";
  appointment: GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_appointment | null;
  blobName: string | null;
  createdDate: any | null;
  doctorType: DoctorType | null;
  createdDoctorProfile: GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_createdDoctorProfile | null;
  consultType: string | null;
  diagnosis: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[] | null;
  symptoms: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_symptoms | null)[] | null;
  followUpDate: any | null;
  followUpAfterInDays: string | null;
  followUp: boolean | null;
  medicinePrescription: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_medicinePrescription | null)[] | null;
  otherInstructions: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_otherInstructions | null)[] | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentState: string | null;
  doctorId: string;
  hospitalId: string | null;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  doctorInfo: GetCaseSheet_getCaseSheet_pastAppointments_doctorInfo | null;
  caseSheet: GetCaseSheet_getCaseSheet_pastAppointments_caseSheet[] | null;
}

export interface GetCaseSheet_getCaseSheet {
  __typename: "CaseSheetFullDetails";
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
  caseSheetDetails: GetCaseSheet_getCaseSheet_caseSheetDetails | null;
  pastAppointments: (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null;
}

export interface GetCaseSheet {
  getCaseSheet: GetCaseSheet_getCaseSheet | null;
}

export interface GetCaseSheetVariables {
  appointmentId: string;
}
