/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PatientConsultsAndOrdersInput, APPOINTMENT_TYPE, APPOINTMENT_STATE, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN, STATUS, Salutation, MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS, MEDICINE_ORDER_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientPastConsultsAndPrescriptions
// ====================================================

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  name: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  medicineConsumptionDurationInDays: string | null;
  medicineDosage: string | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName: string | null;
  id: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet {
  __typename: "CaseSheet";
  consultType: string | null;
  diagnosis: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: string | null;
  id: string | null;
  medicinePrescription: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription | null)[] | null;
  symptoms: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_symptoms | null)[] | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  name: string;
  image: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  experience: string | null;
  city: string | null;
  photoUrl: string | null;
  qualification: string | null;
  specialty: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_specialty;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults {
  __typename: "ConsultRecord";
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  appointmentState: APPOINTMENT_STATE | null;
  hospitalId: string | null;
  isFollowUp: boolean | null;
  followUpParentId: string | null;
  followUpTo: any | null;
  bookingDate: any | null;
  caseSheet: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet | null)[] | null;
  displayId: number;
  status: STATUS;
  doctorInfo: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems {
  __typename: "Medicine";
  medicineSku: string | null;
  medicineName: string | null;
  price: number | null;
  quantity: number | null;
  mrp: number | null;
  id: string;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders {
  __typename: "MedicineOrderRecord";
  id: string;
  orderDateTime: any | null;
  quoteDateTime: any | null;
  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  orderType: MEDICINE_ORDER_TYPE | null;
  estimatedAmount: number | null;
  prescriptionImageUrl: string | null;
  shopId: string | null;
  medicineOrderLineItems: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems | null)[] | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions {
  __typename: "PatientConsultsAndOrders";
  consults: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults | null)[] | null;
  medicineOrders: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders | null)[] | null;
}

export interface getPatientPastConsultsAndPrescriptions {
  getPatientPastConsultsAndPrescriptions: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions | null;
}

export interface getPatientPastConsultsAndPrescriptionsVariables {
  consultsAndOrdersInput?: PatientConsultsAndOrdersInput | null;
}
