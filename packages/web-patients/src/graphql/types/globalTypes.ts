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

export enum ConsultMode {
  BOTH = "BOTH",
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum ConsultType {
  FIXED = "FIXED",
  PREFERRED = "PREFERRED",
}

export enum DoctorType {
  APOLLO = "APOLLO",
  PAYROLL = "PAYROLL",
  STAR_APOLLO = "STAR_APOLLO",
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
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

export enum SEARCH_TYPE {
  DOCTOR = "DOCTOR",
  SPECIALTY = "SPECIALTY",
}

export enum STATUS {
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  MISSED = "MISSED",
}

export enum Salutation {
  DR = "DR",
  Dr = "Dr",
  MR = "MR",
  MRS = "MRS",
  dr = "dr",
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

export interface AppointmentHistoryInput {
  patientId: string;
  doctorId: string;
}

export interface BookAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string | null;
}

export interface DoctorAvailabilityInput {
  availableDate: any;
  doctorId: string;
}

export interface DoctorNextAvailableSlotInput {
  availableDate: any;
  doctorIds: string[];
}

export interface FilterDoctorInput {
  specialty: string;
  city?: (string | null)[] | null;
  experience?: (Range | null)[] | null;
  availability?: (string | null)[] | null;
  fees?: (Range | null)[] | null;
  gender?: (Gender | null)[] | null;
  language?: (string | null)[] | null;
  location?: string | null;
}

export interface PatientAppointmentsInput {
  patientId: string;
  appointmentDate: any;
}

export interface Range {
  minimum?: number | null;
  maximum?: number | null;
}

export interface UpdateAppointmentSessionInput {
  appointmentId: string;
  requestRole: string;
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

export interface filterInput {
  specialty: string;
  city?: (string | null)[] | null;
  experience?: (string | null)[] | null;
  availability?: (string | null)[] | null;
  fees?: (string | null)[] | null;
  gender?: (string | null)[] | null;
  language?: (string | null)[] | null;
  location?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
