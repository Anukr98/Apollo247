/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ModifyCaseSheetInput, MEDICINE_TIMINGS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: modifyCaseSheet
// ====================================================

export interface modifyCaseSheet_modifyCaseSheet_appointment {
  __typename: "Appointment";
  id: string;
}

export interface modifyCaseSheet_modifyCaseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineConsumptionDurationInDays: string | null;
  medicineName: string | null;
  medicineDosage: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineInstructions: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet {
  __typename: "CaseSheet";
  consultType: string | null;
  appointment: modifyCaseSheet_modifyCaseSheet_appointment | null;
  diagnosis: (modifyCaseSheet_modifyCaseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (modifyCaseSheet_modifyCaseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  id: string | null;
  medicinePrescription: (modifyCaseSheet_modifyCaseSheet_medicinePrescription | null)[] | null;
  notes: string | null;
  patientId: string | null;
  symptoms: (modifyCaseSheet_modifyCaseSheet_symptoms | null)[] | null;
  otherInstructions: (modifyCaseSheet_modifyCaseSheet_otherInstructions | null)[] | null;
}

export interface modifyCaseSheet {
  modifyCaseSheet: modifyCaseSheet_modifyCaseSheet | null;
}

export interface modifyCaseSheetVariables {
  ModifyCaseSheetInput?: ModifyCaseSheetInput | null;
}
