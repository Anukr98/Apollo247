/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, Gender, DoctorType, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION, ROUTE_OF_ADMINISTRATION } from "./globalTypes";

// ====================================================
// GraphQL query operation: getSDLatestCompletedCaseSheet
// ====================================================

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_appointment_doctorInfo {
  __typename: "Profile";
  id: string;
  fullName: string | null;
  gender: Gender | null;
  photoUrl: string | null;
  displayName: string | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_appointment {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentState: string | null;
  appointmentType: APPOINTMENT_TYPE;
  doctorId: string;
  hospitalId: string | null;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  displayId: string;
  isFollowUp: number;
  doctorInfo: getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_appointment_doctorInfo | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_radiologyPrescription {
  __typename: "RadiologyPrescription";
  servicename: string | null;
  testInstruction: string | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_medicinePrescription {
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

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails {
  __typename: "CaseSheet";
  appointment: getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_appointment | null;
  consultType: string | null;
  diagnosis: (getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
  diagnosticPrescription: (getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription | null)[] | null;
  radiologyPrescription: (getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_radiologyPrescription | null)[] | null;
  blobName: string | null;
  doctorId: string | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  doctorType: DoctorType | null;
  id: string | null;
  medicinePrescription: (getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null;
  notes: string | null;
  otherInstructions: (getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_otherInstructions | null)[] | null;
  patientId: string | null;
  symptoms: (getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_symptoms | null)[] | null;
  referralSpecialtyName: string | null;
  referralDescription: string | null;
  prescriptionGeneratedDate: any | null;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_patientDetails {
  __typename: "PatientDetails";
  id: string;
}

export interface getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet {
  __typename: "CaseSheetFullDetails";
  caseSheetDetails: getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails | null;
  patientDetails: getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_patientDetails | null;
  juniorDoctorNotes: string | null;
}

export interface getSDLatestCompletedCaseSheet {
  getSDLatestCompletedCaseSheet: getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet | null;
}

export interface getSDLatestCompletedCaseSheetVariables {
  appointmentId?: string | null;
}
