/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN } from "./globalTypes";

// ====================================================
// GraphQL query operation: getCaseSheet
// ====================================================

export interface getCaseSheet_getCaseSheet_caseSheetDetails_appointment {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentState: string | null;
  appointmentType: APPOINTMENT_TYPE;
  doctorId: string;
  hospitalId: string;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  isFollowUp: number;
}

export interface getCaseSheet_getCaseSheet_caseSheetDetails_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface getCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineConsumptionDurationInDays: string | null;
  medicineDosage: string | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName: string | null;
  id: string | null;
}

export interface getCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface getCaseSheet_getCaseSheet_caseSheetDetails_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface getCaseSheet_getCaseSheet_caseSheetDetails {
  __typename: "CaseSheet";
  appointment: getCaseSheet_getCaseSheet_caseSheetDetails_appointment | null;
  consultType: string | null;
  diagnosis: (getCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
  diagnosticPrescription: (getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  id: string | null;
  medicinePrescription: (getCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null;
  notes: string | null;
  otherInstructions: (getCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions | null)[] | null;
  patientId: string | null;
  symptoms: (getCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null;
}

export interface getCaseSheet_getCaseSheet_patientDetails {
  __typename: "PatientDetails";
  id: string;
}

export interface getCaseSheet_getCaseSheet {
  __typename: "CaseSheetFullDetails";
  caseSheetDetails: getCaseSheet_getCaseSheet_caseSheetDetails | null;
  patientDetails: getCaseSheet_getCaseSheet_patientDetails | null;
  juniorDoctorNotes: string | null;
}

export interface getCaseSheet {
  getCaseSheet: getCaseSheet_getCaseSheet | null;
}

export interface getCaseSheetVariables {
  appointmentId?: string | null;
}
