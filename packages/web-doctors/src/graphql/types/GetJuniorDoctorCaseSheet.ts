/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { STATUS, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION, ROUTE_OF_ADMINISTRATION, Gender, Relation, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJuniorDoctorCaseSheet
// ====================================================

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment_appointmentDocuments {
  __typename: "AppointmentDocuments";
  documentPath: string | null;
  prismFileId: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentDocuments: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment_appointmentDocuments | null)[] | null;
  status: STATUS;
  appointmentState: string | null;
  displayId: string;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
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
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails {
  __typename: "CaseSheet";
  id: string | null;
  doctorId: string | null;
  status: string | null;
  referralSpecialtyName: string | null;
  referralDescription: string | null;
  appointment: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment | null;
  medicinePrescription: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null;
  otherInstructions: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions | null)[] | null;
  symptoms: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms | null)[] | null;
  diagnosis: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
  diagnosticPrescription: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription | null)[] | null;
  followUp: boolean | null;
  followUpDate: any | null;
  followUpAfterInDays: string | null;
  consultType: string | null;
  notes: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_juniorDoctorCaseSheet_createdDoctorProfile {
  __typename: "Profile";
  firstName: string | null;
  lastName: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_juniorDoctorCaseSheet {
  __typename: "CaseSheet";
  createdDate: any | null;
  createdDoctorProfile: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_juniorDoctorCaseSheet_createdDoctorProfile | null;
  updatedDate: any | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_familyHistory {
  __typename: "PatientFamilyHistory";
  description: string | null;
  relation: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_healthVault {
  __typename: "PatientHealthVault";
  imageUrls: string | null;
  reportUrls: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_lifeStyle {
  __typename: "PatientLifeStyle";
  description: string | null;
  occupationHistory: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_patientAddress {
  __typename: "Address";
  city: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_patientMedicalHistory {
  __typename: "PatientMedicalHistory";
  bp: string | null;
  dietAllergies: string | null;
  drugAllergies: string | null;
  height: string | null;
  menstrualHistory: string | null;
  pastMedicalHistory: string | null;
  pastSurgicalHistory: string | null;
  temperature: string | null;
  weight: string | null;
  medicationHistory: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails {
  __typename: "PatientDetails";
  allergies: string | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  firstName: string | null;
  familyHistory: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_familyHistory | null)[] | null;
  gender: Gender | null;
  healthVault: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_healthVault | null)[] | null;
  id: string;
  lastName: string | null;
  lifeStyle: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_lifeStyle | null)[] | null;
  mobileNumber: string | null;
  patientAddress: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_patientAddress | null)[] | null;
  patientMedicalHistory: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_patientMedicalHistory | null;
  photoUrl: string | null;
  uhid: string | null;
  relation: Relation | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineName: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineInstructions: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDuration: string | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
  routeOfAdministration: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet {
  __typename: "CaseSheet";
  consultType: string | null;
  doctorType: DoctorType | null;
  diagnosis: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[] | null;
  symptoms: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_symptoms | null)[] | null;
  followUpDate: any | null;
  followUpAfterInDays: string | null;
  followUp: boolean | null;
  medicinePrescription: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_medicinePrescription | null)[] | null;
  otherInstructions: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_otherInstructions | null)[] | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentState: string | null;
  doctorId: string;
  hospitalId: string | null;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  caseSheet: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet[] | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet {
  __typename: "CaseSheetFullDetails";
  caseSheetDetails: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails | null;
  allowedDosages: (string | null)[] | null;
  juniorDoctorCaseSheet: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_juniorDoctorCaseSheet | null;
  patientDetails: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails | null;
  pastAppointments: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments | null)[] | null;
  juniorDoctorNotes: string | null;
}

export interface GetJuniorDoctorCaseSheet {
  getJuniorDoctorCaseSheet: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet | null;
}

export interface GetJuniorDoctorCaseSheetVariables {
  appointmentId?: string | null;
}
