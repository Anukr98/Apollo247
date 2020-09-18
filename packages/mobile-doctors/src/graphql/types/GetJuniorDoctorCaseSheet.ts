/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Gender, Relation, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJuniorDoctorCaseSheet
// ====================================================

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_lifeStyle {
  __typename: "PatientLifeStyle";
  description: string | null;
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

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails {
  __typename: "PatientDetails";
  id: string;
  allergies: string | null;
  lifeStyle: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_lifeStyle | null)[] | null;
  familyHistory: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_familyHistory | null)[] | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  mobileNumber: string | null;
  uhid: string | null;
  photoUrl: string | null;
  relation: Relation | null;
  healthVault: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_healthVault | null)[] | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  medicineName: string | null;
  medicineDosage: string | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineConsumptionDurationInDays: string | null;
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
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails {
  __typename: "CaseSheet";
  id: string | null;
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

export interface GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet {
  __typename: "CaseSheetFullDetails";
  patientDetails: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails | null;
  caseSheetDetails: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails | null;
}

export interface GetJuniorDoctorCaseSheet {
  getJuniorDoctorCaseSheet: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet | null;
}

export interface GetJuniorDoctorCaseSheetVariables {
  appointmentId: string;
}
