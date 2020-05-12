/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ModifyCaseSheetInput, APPOINTMENT_TYPE, STATUS, DoctorType, Gender, Salutation, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION, ROUTE_OF_ADMINISTRATION } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ModifyCaseSheet
// ====================================================

export interface ModifyCaseSheet_modifyCaseSheet_appointment_appointmentDocuments {
  __typename: "AppointmentDocuments";
  documentPath: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet_appointment {
  __typename: "Appointment";
  id: string;
  sdConsultationDate: any | null;
  appointmentDateTime: any;
  appointmentDocuments: (ModifyCaseSheet_modifyCaseSheet_appointment_appointmentDocuments | null)[] | null;
  appointmentState: string | null;
  appointmentType: APPOINTMENT_TYPE;
  displayId: string;
  doctorId: string;
  hospitalId: string | null;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  rescheduleCount: number;
  isFollowUp: number;
  followUpParentId: string | null;
  isTransfer: number;
  transferParentId: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet_createdDoctorProfile {
  __typename: "Profile";
  city: string | null;
  country: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firstName: string | null;
  gender: Gender | null;
  id: string;
  lastName: string | null;
  mobileNumber: string;
  photoUrl: string | null;
  qualification: string | null;
  salutation: Salutation | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zip: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineConsumptionDurationInDays: string | null;
  medicineName: string | null;
  medicineDosage: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineInstructions: string | null;
  medicineConsumptionDuration: string | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
  routeOfAdministration: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface ModifyCaseSheet_modifyCaseSheet {
  __typename: "CaseSheet";
  appointment: ModifyCaseSheet_modifyCaseSheet_appointment | null;
  blobName: string | null;
  createdDate: any | null;
  createdDoctorId: string | null;
  createdDoctorProfile: ModifyCaseSheet_modifyCaseSheet_createdDoctorProfile | null;
  consultType: string | null;
  diagnosis: (ModifyCaseSheet_modifyCaseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (ModifyCaseSheet_modifyCaseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  doctorType: DoctorType | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  followUpConsultType: APPOINTMENT_TYPE | null;
  id: string | null;
  medicinePrescription: (ModifyCaseSheet_modifyCaseSheet_medicinePrescription | null)[] | null;
  notes: string | null;
  otherInstructions: (ModifyCaseSheet_modifyCaseSheet_otherInstructions | null)[] | null;
  patientId: string | null;
  symptoms: (ModifyCaseSheet_modifyCaseSheet_symptoms | null)[] | null;
  status: string | null;
  sentToPatient: boolean | null;
}

export interface ModifyCaseSheet {
  modifyCaseSheet: ModifyCaseSheet_modifyCaseSheet | null;
}

export interface ModifyCaseSheetVariables {
  ModifyCaseSheetInput?: ModifyCaseSheetInput | null;
}
