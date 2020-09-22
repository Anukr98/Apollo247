/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, DoctorType, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_TO_BE_TAKEN, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateSeniorDoctorCaseSheet
// ====================================================

export interface CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_appointment {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentState: string | null;
  appointmentType: APPOINTMENT_TYPE;
  displayId: string;
  doctorId: string;
  hospitalId: string | null;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  rescheduleCount: number;
}

export interface CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineConsumptionDurationInDays: string | null;
  medicineDosage: string | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName: string | null;
  id: string | null;
  medicineConsumptionDuration: string | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
}

export interface CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet {
  __typename: "CaseSheet";
  appointment: CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_appointment | null;
  blobName: string | null;
  consultType: string | null;
  diagnosis: (CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  doctorType: DoctorType | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  id: string | null;
  medicinePrescription: (CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_medicinePrescription | null)[] | null;
  notes: string | null;
  otherInstructions: (CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_otherInstructions | null)[] | null;
  patientId: string | null;
  symptoms: (CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet_symptoms | null)[] | null;
}

export interface CreateSeniorDoctorCaseSheet {
  createSeniorDoctorCaseSheet: CreateSeniorDoctorCaseSheet_createSeniorDoctorCaseSheet | null;
}

export interface CreateSeniorDoctorCaseSheetVariables {
  appointmentId?: string | null;
}
