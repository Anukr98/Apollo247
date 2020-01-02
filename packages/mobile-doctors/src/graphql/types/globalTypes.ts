/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum APPOINTMENT_TYPE {
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum AccountType {
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS",
}

export enum ConsultMode {
  BOTH = "BOTH",
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum ConsultType {
  FIXED = "FIXED",
  PREFERRED = "PREFERRED",
}

export enum DOCTOR_DEVICE_TYPE {
  ANDROID = "ANDROID",
  IOS = "IOS",
}

export enum DoctorType {
  APOLLO = "APOLLO",
  JUNIOR = "JUNIOR",
  PAYROLL = "PAYROLL",
  STAR_APOLLO = "STAR_APOLLO",
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
}

export enum INVITEDSTATUS {
  ACCEPTED = "ACCEPTED",
  NONE = "NONE",
  NOTAPPLICABLE = "NOTAPPLICABLE",
  REJECTED = "REJECTED",
}

export enum MEDICINE_TIMINGS {
  EVENING = "EVENING",
  MORNING = "MORNING",
  NIGHT = "NIGHT",
  NOON = "NOON",
}

export enum MEDICINE_TO_BE_TAKEN {
  AFTER_FOOD = "AFTER_FOOD",
  BEFORE_FOOD = "BEFORE_FOOD",
}

export enum REQUEST_ROLES {
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
}

export enum Relation {
  BROTHER = "BROTHER",
  COUSIN = "COUSIN",
  FATHER = "FATHER",
  HUSBAND = "HUSBAND",
  ME = "ME",
  MOTHER = "MOTHER",
  OTHER = "OTHER",
  SISTER = "SISTER",
  WIFE = "WIFE",
}

export enum STATUS {
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  NO_SHOW = "NO_SHOW",
  PENDING = "PENDING",
}

export enum Salutation {
  DR = "DR",
  MR = "MR",
  MRS = "MRS",
}

export enum TRANSFER_INITIATED_TYPE {
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
}

export enum TRANSFER_STATUS {
  COMPLETED = "COMPLETED",
  INITIATED = "INITIATED",
  REJECTED = "REJECTED",
}

export enum WeekDay {
  FRIDAY = "FRIDAY",
  MONDAY = "MONDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
  THURSDAY = "THURSDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
}

export enum patientLogSort {
  MOST_RECENT = "MOST_RECENT",
  NUMBER_OF_CONSULTS = "NUMBER_OF_CONSULTS",
  PATIENT_NAME_A_TO_Z = "PATIENT_NAME_A_TO_Z",
  PATIENT_NAME_Z_TO_A = "PATIENT_NAME_Z_TO_A",
}

export enum patientLogType {
  All = "All",
  FOLLOW_UP = "FOLLOW_UP",
  REGULAR = "REGULAR",
}

export interface CreateAppointmentSessionInput {
  appointmentId: string;
  requestRole: REQUEST_ROLES;
}

export interface EndAppointmentSessionInput {
  appointmentId: string;
  status: STATUS;
}

export interface RescheduleAppointmentInput {
  appointmentId: string;
  rescheduleReason: string;
  rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE;
  rescheduleInitiatedId: string;
  rescheduledDateTime?: any | null;
  autoSelectSlot?: number | null;
}

export interface SaveDoctorDeviceTokenInput {
  deviceType: DOCTOR_DEVICE_TYPE;
  deviceToken: string;
  deviceOS: string;
  doctorId: string;
}

export interface TransferAppointmentInput {
  appointmentId: string;
  transferReason: string;
  transferredDoctorId?: string | null;
  transferredSpecialtyId?: string | null;
  transferNotes?: string | null;
  transferInitiatedBy?: TRANSFER_INITIATED_TYPE | null;
  transferInitiatedId: string;
}

export interface UpdateCaseSheetInput {
  symptoms?: string | null;
  notes?: string | null;
  diagnosis?: string | null;
  diagnosticPrescription?: string | null;
  followUp?: boolean | null;
  followUpDate?: string | null;
  followUpAfterInDays?: string | null;
  otherInstructions?: string | null;
  medicinePrescription?: string | null;
  id?: string | null;
}

export interface UpdatePatientInput {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  mobileNumber?: string | null;
  gender?: Gender | null;
  uhid?: string | null;
  emailAddress?: string | null;
  dateOfBirth?: any | null;
  relation?: Relation | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
