/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientConsultsAndOrdersInput, APPOINTMENT_TYPE, APPOINTMENT_STATE, DoctorType, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS, MEDICINE_UNIT, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_CONSUMPTION_DURATION, ROUTE_OF_ADMINISTRATION, STATUS, MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS_CONSULT, MEDICINE_ORDER_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientPastConsultsAndPrescriptions
// ====================================================

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription {
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

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_symptoms {
  __typename: "SymptomList";
  symptom: string | null;
  since: string | null;
  howOften: string | null;
  severity: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet {
  __typename: "CaseSheet";
  notes: string | null;
  blobName: string | null;
  consultType: string | null;
  diagnosis: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosis | null)[] | null;
  diagnosticPrescription: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription | null)[] | null;
  doctorId: string | null;
  doctorType: DoctorType | null;
  followUp: boolean | null;
  followUpAfterInDays: string | null;
  followUpDate: any | null;
  id: string | null;
  medicinePrescription: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription | null)[] | null;
  symptoms: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_symptoms | null)[] | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
  image: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_doctorHospital_facility;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo {
  __typename: "DoctorDetails";
  id: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  city: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  photoUrl: string | null;
  qualification: string | null;
  specialty: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_specialty | null;
  doctorHospital: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_doctorHospital[];
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
  displayId: number;
  bookingDate: any | null;
  caseSheet: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet | null)[] | null;
  status: STATUS;
  doctorInfo: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems {
  __typename: "Medicine";
  medicineSKU: string | null;
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
  currentStatus: MEDICINE_ORDER_STATUS_CONSULT | null;
  orderType: MEDICINE_ORDER_TYPE | null;
  estimatedAmount: number | null;
  prescriptionImageUrl: string | null;
  shopId: string | null;
  prismPrescriptionFileId: string | null;
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
