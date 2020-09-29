/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientAppointmentsInput, APPOINTMENT_TYPE, STATUS, APPOINTMENT_STATE, DoctorType, ConsultMode, ConsultType, WeekDay } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPatientAppointments
// ====================================================

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_appointmentPayments {
  __typename: "AppointmentPayment";
  id: string;
  amountPaid: number;
  paymentRefId: string | null;
  paymentStatus: string;
  paymentDateTime: any;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty {
  __typename: "DoctorSpecialties";
  name: string;
  id: string;
  specialistSingularTerm: string | null;
  specialistPluralTerm: string | null;
  userFriendlyNomenclature: string | null;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital_facility {
  __typename: "Facility";
  city: string | null;
  country: string | null;
  facilityType: string;
  id: string;
  imageUrl: string | null;
  name: string;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zipcode: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital_facility;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_consultHours_facility {
  __typename: "Facility";
  city: string | null;
  country: string | null;
  facilityType: string;
  id: string;
  imageUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  name: string;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zipcode: string | null;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  endTime: string;
  facility: GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_consultHours_facility | null;
  id: string;
  isActive: boolean;
  startTime: string;
  weekDay: WeekDay;
  consultDuration: number | null;
  consultBuffer: number | null;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  id: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  displayName: string | null;
  doctorType: DoctorType;
  experience: string | null;
  isActive: boolean;
  photoUrl: string | null;
  qualification: string | null;
  specialization: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  specialty: GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_specialty | null;
  doctorHospital: GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_doctorHospital[];
  consultHours: (GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo_consultHours | null)[] | null;
}

export interface GetPatientAppointments_getPatinetAppointments_patinetAppointments {
  __typename: "PatinetAppointments";
  appointmentPayments: (GetPatientAppointments_getPatinetAppointments_patinetAppointments_appointmentPayments | null)[] | null;
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
  rescheduleCount: number | null;
  isConsultStarted: boolean | null;
  appointmentState: APPOINTMENT_STATE | null;
  isFollowUp: string;
  displayId: number | null;
  isJdQuestionsComplete: boolean | null;
  isSeniorConsultStarted: boolean | null;
  symptoms: string | null;
  paymentOrderId: string | null;
  couponCode: string | null;
  actualAmount: number | null;
  discountedAmount: number | null;
  doctorInfo: GetPatientAppointments_getPatinetAppointments_patinetAppointments_doctorInfo | null;
}

export interface GetPatientAppointments_getPatinetAppointments {
  __typename: "PatientAppointmentsResult";
  patinetAppointments: GetPatientAppointments_getPatinetAppointments_patinetAppointments[] | null;
}

export interface GetPatientAppointments {
  getPatinetAppointments: GetPatientAppointments_getPatinetAppointments;
}

export interface GetPatientAppointmentsVariables {
  patientAppointmentsInput?: PatientAppointmentsInput | null;
}
