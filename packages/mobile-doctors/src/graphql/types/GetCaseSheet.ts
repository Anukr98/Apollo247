/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Gender, Relation, PATIENT_ADDRESS_TYPE, APPOINTMENT_TYPE, DoctorType, DOCTOR_ONLINE_STATUS, STATUS, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION, ROUTE_OF_ADMINISTRATION } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCaseSheet
// ====================================================

export interface GetCaseSheet_getCaseSheet_patientDetails_lifeStyle {
  __typename: "PatientLifeStyle";
  description: string | null;
  occupationHistory: string | null;
}

export interface GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory {
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

export interface GetCaseSheet_getCaseSheet_patientDetails_familyHistory {
  __typename: "PatientFamilyHistory";
  description: string | null;
  relation: string | null;
}

export interface GetCaseSheet_getCaseSheet_patientDetails_patientAddress {
  __typename: "Address";
  city: string | null;
}

export interface GetCaseSheet_getCaseSheet_patientDetails_healthVault {
  __typename: "PatientHealthVault";
  imageUrls: string | null;
  reportUrls: string | null;
}

export interface GetCaseSheet_getCaseSheet_patientDetails {
  __typename: "PatientDetails";
  id: string;
  allergies: string | null;
  lifeStyle: (GetCaseSheet_getCaseSheet_patientDetails_lifeStyle | null)[] | null;
  patientMedicalHistory: GetCaseSheet_getCaseSheet_patientDetails_patientMedicalHistory | null;
  familyHistory: (GetCaseSheet_getCaseSheet_patientDetails_familyHistory | null)[] | null;
  patientAddress: (GetCaseSheet_getCaseSheet_patientDetails_patientAddress | null)[] | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  mobileNumber: string | null;
  uhid: string | null;
  photoUrl: string | null;
  relation: Relation | null;
  healthVault: (GetCaseSheet_getCaseSheet_patientDetails_healthVault | null)[] | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_familyHistory {
  __typename: "FamilyHistory";
  description: string | null;
  relation: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_healthVault {
  __typename: "HealthVault";
  imageUrls: string | null;
  reportUrls: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle {
  __typename: "LifeStyle";
  description: string | null;
  occupationHistory: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientAddress {
  __typename: "PatientAddress";
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  mobileNumber: string | null;
  state: string | null;
  zipcode: string | null;
  landmark: string | null;
  createdDate: any | null;
  updatedDate: any | null;
  addressType: PATIENT_ADDRESS_TYPE | null;
  otherAddressType: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory {
  __typename: "MedicalHistory";
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

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails {
  __typename: "PatientFullDetails";
  allergies: string | null;
  dateOfBirth: any | null;
  emailAddress: string | null;
  firstName: string | null;
  familyHistory: (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_familyHistory | null)[] | null;
  gender: Gender | null;
  healthVault: (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_healthVault | null)[] | null;
  id: string;
  lastName: string | null;
  lifeStyle: (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle | null)[] | null;
  mobileNumber: string | null;
  patientAddress: (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientAddress | null)[] | null;
  patientMedicalHistory: GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory | null;
  photoUrl: string | null;
  uhid: string | null;
  relation: Relation | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_appointmentDocuments {
  __typename: "AppointmentDocuments";
  documentPath: string | null;
  prismFileId: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  facilityType: string;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo_doctorHospital_facility;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo {
  __typename: "Profile";
  id: string;
  fullName: string | null;
  doctorType: DoctorType;
  mobileNumber: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  doctorHospital: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo_doctorHospital[];
  specialty: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo_specialty;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_appointment {
  __typename: "Appointment";
  id: string;
  appointmentDateTime: any;
  appointmentDocuments: (GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_appointmentDocuments | null)[] | null;
  appointmentState: string | null;
  appointmentType: APPOINTMENT_TYPE;
  displayId: string;
  doctorId: string;
  doctorInfo: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_doctorInfo | null;
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
  sdConsultationDate: any | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile_specialty {
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

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile_doctorHospital_facility {
  __typename: "Facility";
  city: string | null;
  country: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zipcode: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile_doctorHospital_facility;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile {
  __typename: "Profile";
  doctorType: DoctorType;
  emailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  salutation: string | null;
  registrationNumber: string | null;
  signature: string | null;
  photoUrl: string | null;
  specialty: GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile_specialty;
  doctorHospital: GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile_doctorHospital[];
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription {
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

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription {
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

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface GetCaseSheet_getCaseSheet_caseSheetDetails {
  __typename: "CaseSheet";
  id: string | null;
  blobName: string | null;
  doctorId: string | null;
  patientId: string | null;
  sentToPatient: boolean | null;
  status: string | null;
  referralSpecialtyName: string | null;
  referralDescription: string | null;
  patientDetails: GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails | null;
  appointment: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment | null;
  createdDoctorProfile: GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile | null;
  medicinePrescription: (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null;
  removedMedicinePrescription: (GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription | null)[] | null;
  otherInstructions: (GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions | null)[] | null;
  symptoms: (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null;
  diagnosis: (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
  diagnosticPrescription: (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription | null)[] | null;
  followUp: boolean | null;
  followUpDate: any | null;
  followUpAfterInDays: string | null;
  followUpConsultType: APPOINTMENT_TYPE | null;
  consultType: string | null;
  notes: string | null;
  updatedDate: any | null;
  version: number | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
  details: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_medicinePrescription {
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

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_removedMedicinePrescription {
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

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_otherInstructions {
  __typename: "OtherInstructions";
  instruction: string | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments_caseSheet {
  __typename: "CaseSheet";
  consultType: string | null;
  doctorType: DoctorType | null;
  referralSpecialtyName: string | null;
  referralDescription: string | null;
  diagnosis: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[] | null;
  symptoms: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_symptoms | null)[] | null;
  followUpDate: any | null;
  followUpAfterInDays: string | null;
  followUp: boolean | null;
  medicinePrescription: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_medicinePrescription | null)[] | null;
  removedMedicinePrescription: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_removedMedicinePrescription | null)[] | null;
  otherInstructions: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_otherInstructions | null)[] | null;
  notes: string | null;
  version: number | null;
}

export interface GetCaseSheet_getCaseSheet_pastAppointments {
  __typename: "Appointment";
  id: string;
  displayId: string;
  appointmentDateTime: any;
  appointmentState: string | null;
  doctorId: string;
  hospitalId: string | null;
  patientId: string;
  parentId: string | null;
  status: STATUS;
  caseSheet: GetCaseSheet_getCaseSheet_pastAppointments_caseSheet[] | null;
  appointmentType: APPOINTMENT_TYPE;
  sdConsultationDate: any | null;
}

export interface GetCaseSheet_getCaseSheet_juniorDoctorCaseSheet_createdDoctorProfile {
  __typename: "Profile";
  firstName: string | null;
  lastName: string | null;
  salutation: string | null;
}

export interface GetCaseSheet_getCaseSheet_juniorDoctorCaseSheet {
  __typename: "CaseSheet";
  createdDate: any | null;
  doctorId: string | null;
  createdDoctorProfile: GetCaseSheet_getCaseSheet_juniorDoctorCaseSheet_createdDoctorProfile | null;
  updatedDate: any | null;
}

export interface GetCaseSheet_getCaseSheet {
  __typename: "CaseSheetFullDetails";
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
  caseSheetDetails: GetCaseSheet_getCaseSheet_caseSheetDetails | null;
  pastAppointments: (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null;
  juniorDoctorNotes: string | null;
  juniorDoctorCaseSheet: GetCaseSheet_getCaseSheet_juniorDoctorCaseSheet | null;
  allowedDosages: (string | null)[] | null;
}

export interface GetCaseSheet {
  getCaseSheet: GetCaseSheet_getCaseSheet | null;
}

export interface GetCaseSheetVariables {
  appointmentId: string;
}
