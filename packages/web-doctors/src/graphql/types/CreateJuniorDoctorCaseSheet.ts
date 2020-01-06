/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, DoctorType, MEDICINE_UNIT, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateJuniorDoctorCaseSheet
// ====================================================

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_appointment_appointmentDocuments {
  __typename: "AppointmentDocuments";
  documentPath: string | null;
}

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_appointment {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentDocuments: (CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_appointment_appointmentDocuments | null)[] | null;
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

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineConsumptionDurationInDays: string | null;
  medicineDosage: string | null;
  medicineInstructions: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName: string | null;
  id: string | null;
  medicineConsumptionDuration: string | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
}

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet {
  __typename: "CaseSheet";
  appointment: CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_appointment | null;
  blobName: string | null;
  consultType: string | null;
  diagnosis: (CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  doctorType: DoctorType | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  id: string | null;
  medicinePrescription: (CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_medicinePrescription | null)[] | null;
  notes: string | null;
  otherInstructions: (CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_otherInstructions | null)[] | null;
  patientId: string | null;
  symptoms: (CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet_symptoms | null)[] | null;
}

export interface CreateJuniorDoctorCaseSheet {
  createJuniorDoctorCaseSheet: CreateJuniorDoctorCaseSheet_createJuniorDoctorCaseSheet | null;
}

export interface CreateJuniorDoctorCaseSheetVariables {
  appointmentId?: string | null;
}
