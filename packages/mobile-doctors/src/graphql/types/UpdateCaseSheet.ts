/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdateCaseSheetInput, MEDICINE_TIMINGS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateCaseSheet
// ====================================================

export interface UpdateCaseSheet_updateCaseSheet_appointment {
  __typename: "Appointment";
  id: string | null;
}

export interface UpdateCaseSheet_updateCaseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface UpdateCaseSheet_updateCaseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  name: string | null;
}

export interface UpdateCaseSheet_updateCaseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineConsumptionDurationInDays: string | null;
  medicineName: string | null;
  medicineDosage: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineInstructions: string | null;
}

export interface UpdateCaseSheet_updateCaseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface UpdateCaseSheet_updateCaseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface UpdateCaseSheet_updateCaseSheet {
  __typename: "CaseSheet";
  consultType: string | null;
  appointment: UpdateCaseSheet_updateCaseSheet_appointment | null;
  diagnosis: (UpdateCaseSheet_updateCaseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (UpdateCaseSheet_updateCaseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: string | null;
  id: string | null;
  medicinePrescription: (UpdateCaseSheet_updateCaseSheet_medicinePrescription | null)[] | null;
  notes: string | null;
  patientId: string | null;
  symptoms: (UpdateCaseSheet_updateCaseSheet_symptoms | null)[] | null;
  otherInstructions: (UpdateCaseSheet_updateCaseSheet_otherInstructions | null)[] | null;
}

export interface UpdateCaseSheet {
  updateCaseSheet: UpdateCaseSheet_updateCaseSheet | null;
}

export interface UpdateCaseSheetVariables {
  UpdateCaseSheetInput?: UpdateCaseSheetInput | null;
}
