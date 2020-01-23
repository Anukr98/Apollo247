/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PatientConsultsAndOrdersInput, APPOINTMENT_TYPE, APPOINTMENT_STATE, TEST_COLLECTION_TYPE, DIAGNOSTICS_TYPE, DoctorType, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN, MEDICINE_UNIT, STATUS, Salutation, MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS, MEDICINE_ORDER_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientPastConsultsAndPrescriptions
// ====================================================

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosis {
  __typename: "Diagnosis";
  name: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription_additionalDetails {
  __typename: "DiagnosticDetailsInCaseSheet";
  city: string | null;
  collectionType: TEST_COLLECTION_TYPE | null;
  fromAgeInDays: number | null;
  gender: string | null;
  id: string | null;
  itemId: number | null;
  itemName: string | null;
  itemRemarks: string | null;
  itemType: DIAGNOSTICS_TYPE | null;
  rate: number | null;
  state: string | null;
  testPreparationData: string | null;
  toAgeInDays: number | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  additionalDetails: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription_additionalDetails | null;
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
  medicineUnit: MEDICINE_UNIT | null;
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
  name: string;
  image: string | null;
}

export interface getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  experience: string | null;
  city: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  photoUrl: string | null;
  qualification: string | null;
  specialty: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_doctorInfo_specialty | null;
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
  currentStatus: MEDICINE_ORDER_STATUS | null;
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
