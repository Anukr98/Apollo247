/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS, APPOINTMENT_STATE, DoctorType, Gender, DOCTOR_ONLINE_STATUS, ConsultMode, ConsultType, WeekDay, MEDICINE_UNIT, MEDICINE_TIMINGS, MEDICINE_CONSUMPTION_DURATION } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPatientAllAppointments
// ====================================================

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_appointmentPayments {
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

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_bankAccount {
  __typename: "BankAccount";
  accountHolderName: string | null;
  accountNumber: string | null;
  accountType: AccountType | null;
  bankName: string | null;
  city: string | null;
  id: string | null;
  IFSCcode: string | null;
  state: string | null;
  streetLine1: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_consultHours_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  endTime: string;
  facility: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_consultHours_facility | null;
  id: string;
  isActive: boolean;
  startTime: string;
  weekDay: WeekDay;
  consultDuration: number | null;
  consultBuffer: number | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorSecretary {
  __typename: "DoctorSecretaryDetails";
  secretary: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorSecretary_secretary | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_packages {
  __typename: "Packages";
  fees: string;
  id: string;
  name: string;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_specialty {
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

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  awards: string | null;
  city: string | null;
  country: string | null;
  chatDays: number | null;
  dateOfBirth: string | null;
  displayName: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firebaseToken: string | null;
  firstName: string;
  fullName: string | null;
  gender: Gender | null;
  isActive: boolean;
  id: string;
  languages: string | null;
  lastName: string;
  mobileNumber: string;
  onlineConsultationFees: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string;
  salutation: string | null;
  signature: string | null;
  specialization: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  thumbnailUrl: string | null;
  zip: string | null;
  bankAccount: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_bankAccount | null)[] | null;
  consultHours: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_consultHours | null)[] | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorHospital[];
  doctorSecretary: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_doctorSecretary | null;
  packages: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_packages | null)[] | null;
  specialty: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_specialty | null;
  starTeam: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo_starTeam | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  medicineName: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineDosage: string | null;
  medicineCustomDosage: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet {
  __typename: "CaseSheet";
  id: string | null;
  followUpAfterInDays: string | null;
  version: number | null;
  doctorType: DoctorType | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet_medicinePrescription | null)[] | null;
  diagnosticPrescription: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet_diagnosticPrescription | null)[] | null;
  blobName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments {
  __typename: "PatinetAppointments";
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_appointmentPayments | null)[] | null;
  id: string;
  hideHealthRecordNudge: boolean | null;
  discountedAmount: number | null;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
  rescheduleCount: number | null;
  isFollowUp: string;
  appointmentState: APPOINTMENT_STATE | null;
  displayId: number | null;
  isConsultStarted: boolean | null;
  isSeniorConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isAutomatedQuestionsComplete: boolean | null;
  symptoms: string | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_doctorInfo | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_cancelledAppointments_caseSheet | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_appointmentPayments {
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

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_bankAccount {
  __typename: "BankAccount";
  accountHolderName: string | null;
  accountNumber: string | null;
  accountType: AccountType | null;
  bankName: string | null;
  city: string | null;
  id: string | null;
  IFSCcode: string | null;
  state: string | null;
  streetLine1: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_consultHours_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  endTime: string;
  facility: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_consultHours_facility | null;
  id: string;
  isActive: boolean;
  startTime: string;
  weekDay: WeekDay;
  consultDuration: number | null;
  consultBuffer: number | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorSecretary {
  __typename: "DoctorSecretaryDetails";
  secretary: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorSecretary_secretary | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_packages {
  __typename: "Packages";
  fees: string;
  id: string;
  name: string;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_specialty {
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

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo {
  __typename: "DoctorDetailsWithStatusExclude";
  awards: string | null;
  city: string | null;
  country: string | null;
  chatDays: number | null;
  dateOfBirth: string | null;
  displayName: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firebaseToken: string | null;
  firstName: string;
  fullName: string | null;
  gender: Gender | null;
  isActive: boolean;
  id: string;
  languages: string | null;
  lastName: string;
  mobileNumber: string;
  onlineConsultationFees: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string;
  salutation: string | null;
  signature: string | null;
  specialization: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  thumbnailUrl: string | null;
  zip: string | null;
  bankAccount: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_bankAccount | null)[] | null;
  consultHours: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_consultHours | null)[] | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorHospital[];
  doctorSecretary: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_doctorSecretary | null;
  packages: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_packages | null)[] | null;
  specialty: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_specialty | null;
  starTeam: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo_starTeam | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  medicineName: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineDosage: string | null;
  medicineCustomDosage: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet {
  __typename: "CaseSheet";
  id: string | null;
  followUpAfterInDays: string | null;
  version: number | null;
  doctorType: DoctorType | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet_medicinePrescription | null)[] | null;
  diagnosticPrescription: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet_diagnosticPrescription | null)[] | null;
  blobName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_followUpAppointments {
  __typename: "PatinetAppointments";
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_appointmentPayments | null)[] | null;
  id: string;
  hideHealthRecordNudge: boolean | null;
  discountedAmount: number | null;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
  rescheduleCount: number | null;
  isFollowUp: string;
  appointmentState: APPOINTMENT_STATE | null;
  displayId: number | null;
  isConsultStarted: boolean | null;
  isSeniorConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isAutomatedQuestionsComplete: boolean | null;
  symptoms: string | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_doctorInfo | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_followUpAppointments_caseSheet | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_appointmentPayments {
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

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_bankAccount {
  __typename: "BankAccount";
  accountHolderName: string | null;
  accountNumber: string | null;
  accountType: AccountType | null;
  bankName: string | null;
  city: string | null;
  id: string | null;
  IFSCcode: string | null;
  state: string | null;
  streetLine1: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_consultHours_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  endTime: string;
  facility: getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_consultHours_facility | null;
  id: string;
  isActive: boolean;
  startTime: string;
  weekDay: WeekDay;
  consultDuration: number | null;
  consultBuffer: number | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_doctorHospital_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_specialty {
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

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo {
  __typename: "Profile";
  allowBookingRequest: boolean | null;
  awards: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: string | null;
  displayName: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firebaseToken: string | null;
  firstName: string | null;
  fullName: string | null;
  gender: Gender | null;
  isActive: boolean;
  id: string;
  languages: string | null;
  lastName: string;
  mobileNumber: string;
  onlineConsultationFees: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string;
  salutation: string | null;
  signature: string | null;
  specialization: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  thumbnailUrl: string | null;
  zip: string | null;
  bankAccount: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_bankAccount | null)[] | null;
  consultHours: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_consultHours | null)[] | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_doctorHospital[];
  doctorSecretary: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_doctorSecretary | null;
  packages: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_packages | null)[] | null;
  specialty: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_specialty | null;
  starTeam: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo_starTeam | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  medicineName: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineDosage: string | null;
  medicineCustomDosage: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet {
  __typename: "CaseSheet";
  id: string | null;
  followUpAfterInDays: string | null;
  version: number | null;
  doctorType: DoctorType | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription | null)[] | null;
  diagnosticPrescription: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_diagnosticPrescription | null)[] | null;
  blobName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_activeAppointments {
  __typename: "PatinetAppointments";
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_appointmentPayments | null)[] | null;
  id: string;
  hideHealthRecordNudge: boolean | null;
  discountedAmount: number | null;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
  rescheduleCount: number | null;
  isFollowUp: string;
  appointmentState: APPOINTMENT_STATE | null;
  displayId: number | null;
  isConsultStarted: boolean | null;
  isSeniorConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isAutomatedQuestionsComplete: boolean | null;
  symptoms: string | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_activeAppointments_doctorInfo | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_appointmentPayments {
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

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_bankAccount {
  __typename: "BankAccount";
  accountHolderName: string | null;
  accountNumber: string | null;
  accountType: AccountType | null;
  bankName: string | null;
  city: string | null;
  id: string | null;
  IFSCcode: string | null;
  state: string | null;
  streetLine1: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_consultHours_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  endTime: string;
  facility: getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_consultHours_facility | null;
  id: string;
  isActive: boolean;
  startTime: string;
  weekDay: WeekDay;
  consultDuration: number | null;
  consultBuffer: number | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorHospital_facility {
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

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorHospital {
  __typename: "DoctorHospital";
  facility: getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorHospital_facility;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorSecretary {
  __typename: "DoctorSecretaryDetails";
  secretary: getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_doctorSecretary_secretary | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_packages {
  __typename: "Packages";
  fees: string;
  id: string;
  name: string;
}

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_specialty {
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

export interface getPatientAllAppointments_getPatientAllAppointments_completedAppointments_doctorInfo_starTeam {
  __typename: "StarTeam";
  isActive: boolean | null;
  id: string;
  languages: string | null;
  lastName: string | null;
  mobileNumber: string;
  onlineConsultationFees: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string | null;
  salutation: string | null;
  signature: string | null;
  specialization: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  thumbnailUrl: string | null;
  zip: string | null;
  consultHours: (getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_consultHours | null)[] | null;
  doctorHospital: getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_doctorHospital[];
  specialty: getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_specialty;
  starTeam: (getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo_starTeam | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet_medicinePrescription {
  __typename: "MedicinePrescription";
  id: string | null;
  medicineName: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineDosage: string | null;
  medicineCustomDosage: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet_diagnosticPrescription {
  __typename: "DiagnosticPrescription";
  itemname: string | null;
  testInstruction: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet {
  __typename: "CaseSheet";
  id: string | null;
  followUpAfterInDays: string | null;
  version: number | null;
  doctorType: DoctorType | null;
  sentToPatient: boolean | null;
  medicinePrescription: (getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet_medicinePrescription | null)[] | null;
  diagnosticPrescription: (getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet_diagnosticPrescription | null)[] | null;
  blobName: string | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments_appointments {
  __typename: "PatinetAppointments";
  patientName: string | null;
  appointmentPayments: (getPatientAllAppointments_getPatientAllAppointments_appointments_appointmentPayments | null)[] | null;
  id: string;
  hideHealthRecordNudge: boolean | null;
  discountedAmount: number | null;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  bookingDate: any | null;
  rescheduleCount: number | null;
  isFollowUp: string;
  appointmentState: APPOINTMENT_STATE | null;
  displayId: number | null;
  isConsultStarted: boolean | null;
  isSeniorConsultStarted: boolean | null;
  isJdQuestionsComplete: boolean | null;
  isAutomatedQuestionsComplete: boolean | null;
  symptoms: string | null;
  doctorInfo: getPatientAllAppointments_getPatientAllAppointments_appointments_doctorInfo | null;
  caseSheet: (getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet | null)[] | null;
}

export interface getPatientAllAppointments_getPatientAllAppointments {
  __typename: "PatientAllAppointmentsResult";
  totalAppointmentCount: number | null;
  appointments: getPatientAllAppointments_getPatientAllAppointments_appointments[] | null;
}

export interface getPatientAllAppointments {
  getPatientAllAppointments: getPatientAllAppointments_getPatientAllAppointments;
}

export interface getPatientAllAppointmentsVariables {
  patientId: string;
  patientMobile: string;
  offset: number;
  limit: number;
}
