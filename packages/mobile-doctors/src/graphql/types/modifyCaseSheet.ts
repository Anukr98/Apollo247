/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ModifyCaseSheetInput, APPOINTMENT_TYPE, STATUS, DoctorType, Gender, Salutation, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION, ROUTE_OF_ADMINISTRATION } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: modifyCaseSheet
// ====================================================

export interface modifyCaseSheet_modifyCaseSheet_appointment_appointmentDocuments {
  __typename: "AppointmentDocuments";
  documentPath: string | null;
  prismFileId: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_appointment {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentDocuments: (modifyCaseSheet_modifyCaseSheet_appointment_appointmentDocuments | null)[] | null;
  appointmentState: string | null;
  appointmentType: APPOINTMENT_TYPE;
  displayId: string;
  doctorId: string;
  hospitalId: string | null;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  rescheduleCount: number;
  rescheduleCountByDoctor: number;
  isFollowUp: number;
  followUpParentId: string | null;
  isTransfer: number;
  transferParentId: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_createdDoctorProfile_specialty {
  __typename: "DoctorSpecialties";
  createdDate: string | null;
  id: string;
  image: string | null;
  name: string;
  specialistSingularTerm: string | null;
  specialistPluralTerm: string | null;
  userFriendlyNomenclature: string | null;
  displayOrder: number | null;
}

export interface modifyCaseSheet_modifyCaseSheet_createdDoctorProfile_doctorHospital_facility {
  __typename: "Facility";
  city: string | null;
  country: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zipcode: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_createdDoctorProfile_doctorHospital {
  __typename: "DoctorHospital";
  facility: modifyCaseSheet_modifyCaseSheet_createdDoctorProfile_doctorHospital_facility;
}

export interface modifyCaseSheet_modifyCaseSheet_createdDoctorProfile {
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
  registrationNumber: string | null;
  signature: string | null;
  specialty: modifyCaseSheet_modifyCaseSheet_createdDoctorProfile_specialty;
  doctorHospital: modifyCaseSheet_modifyCaseSheet_createdDoctorProfile_doctorHospital[];
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
}

export interface modifyCaseSheet_modifyCaseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface modifyCaseSheet_modifyCaseSheet {
  __typename: "CaseSheet";
  appointment: modifyCaseSheet_modifyCaseSheet_appointment | null;
  blobName: string | null;
  createdDate: any | null;
  createdDoctorId: string | null;
  createdDoctorProfile: modifyCaseSheet_modifyCaseSheet_createdDoctorProfile | null;
  consultType: string | null;
  diagnosis: (modifyCaseSheet_modifyCaseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (modifyCaseSheet_modifyCaseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  doctorType: DoctorType | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  followUpConsultType: APPOINTMENT_TYPE | null;
  id: string | null;
  medicinePrescription: (modifyCaseSheet_modifyCaseSheet_medicinePrescription | null)[] | null;
  notes: string | null;
  otherInstructions: (modifyCaseSheet_modifyCaseSheet_otherInstructions | null)[] | null;
  patientId: string | null;
  symptoms: (modifyCaseSheet_modifyCaseSheet_symptoms | null)[] | null;
  status: string | null;
  sentToPatient: boolean | null;
  updatedDate: any | null;
}

export interface modifyCaseSheet {
  modifyCaseSheet: modifyCaseSheet_modifyCaseSheet | null;
}

export interface modifyCaseSheetVariables {
  ModifyCaseSheetInput?: ModifyCaseSheetInput | null;
}
