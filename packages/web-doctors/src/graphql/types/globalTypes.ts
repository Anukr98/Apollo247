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

export enum APPT_CALL_TYPE {
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

export enum AccountType {
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS",
}

export enum CASESHEET_STATUS {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
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

export enum DOCTOR_CALL_TYPE {
  JUNIOR = "JUNIOR",
  SENIOR = "SENIOR",
}

export enum DOCTOR_ONLINE_STATUS {
  AWAY = "AWAY",
  ONLINE = "ONLINE",
}

export enum DoctorType {
  ADMIN = "ADMIN",
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

export enum MEDICINE_UNIT {
  CAPSULE = "CAPSULE",
  DROPS = "DROPS",
  ML = "ML",
  NA = "NA",
  TABLET = "TABLET",
}

export enum REQUEST_ROLES {
  DOCTOR = "DOCTOR",
  JUNIOR = "JUNIOR",
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
  PAYMENT_PENDING = "PAYMENT_PENDING",
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

export interface DiagnosisInput {
  name?: string | null;
}

export interface DiagnosticPrescriptionInput {
  itemname?: string | null;
}

export interface EndAppointmentSessionInput {
  appointmentId: string;
  status: STATUS;
}

export interface MedicinePrescriptionInput {
  medicineConsumptionDurationInDays?: string | null;
  medicineDosage?: string | null;
  medicineUnit?: MEDICINE_UNIT | null;
  medicineInstructions?: string | null;
  medicineTimings?: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken?: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName?: string | null;
  id?: string | null;
}

export interface ModifyCaseSheetInput {
  symptoms?: SymptomInput[] | null;
  notes?: string | null;
  diagnosis?: DiagnosisInput[] | null;
  diagnosticPrescription?: DiagnosticPrescriptionInput[] | null;
  followUp?: boolean | null;
  followUpDate?: any | null;
  followUpAfterInDays?: number | null;
  followUpConsultType?: APPOINTMENT_TYPE | null;
  otherInstructions?: OtherInstructionsInput[] | null;
  medicinePrescription?: MedicinePrescriptionInput[] | null;
  id: string;
  status?: CASESHEET_STATUS | null;
  lifeStyle?: string | null;
  familyHistory?: string | null;
  dietAllergies?: string | null;
  drugAllergies?: string | null;
  height?: string | null;
  menstrualHistory?: string | null;
  pastMedicalHistory?: string | null;
  pastSurgicalHistory?: string | null;
  temperature?: string | null;
  weight?: string | null;
  bp?: string | null;
}

export interface OtherInstructionsInput {
  instruction?: string | null;
}

export interface PatientFamilyHistoryInput {
  patientId: string;
  description: string;
  relation: Relation;
}

export interface PatientLifeStyleInput {
  patientId: string;
  description: string;
}

export interface RescheduleAppointmentInput {
  appointmentId: string;
  rescheduleReason: string;
  rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE;
  rescheduleInitiatedId: string;
  rescheduledDateTime?: any | null;
  autoSelectSlot?: number | null;
}

export interface SymptomInput {
  symptom?: string | null;
  since?: string | null;
  howOften?: string | null;
  severity?: string | null;
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
  status?: CASESHEET_STATUS | null;
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
  photoUrl?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
