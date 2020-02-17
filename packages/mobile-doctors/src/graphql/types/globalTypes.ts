/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum APPOINTMENT_STATE {
  AWAITING_RESCHEDULE = "AWAITING_RESCHEDULE",
  AWAITING_TRANSFER = "AWAITING_TRANSFER",
  NEW = "NEW",
  RESCHEDULE = "RESCHEDULE",
  TRANSFER = "TRANSFER",
  TRANSFERRED = "TRANSFERRED",
}

export enum APPOINTMENT_TYPE {
  BOTH = "BOTH",
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum APPT_CALL_TYPE {
  AUDIO = "AUDIO",
  CHAT = "CHAT",
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

export enum LOGIN_TYPE {
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
}

export enum MEDICINE_CONSUMPTION_DURATION {
  DAYS = "DAYS",
  MONTHS = "MONTHS",
  WEEKS = "WEEKS",
}

export enum MEDICINE_FORM_TYPES {
  GEL_LOTION_OINTMENT = "GEL_LOTION_OINTMENT",
  OTHERS = "OTHERS",
}

export enum MEDICINE_FREQUENCY {
  AS_NEEDED = "AS_NEEDED",
  FIVE_TIMES_A_DAY = "FIVE_TIMES_A_DAY",
  FOUR_TIMES_A_DAY = "FOUR_TIMES_A_DAY",
  ONCE_A_DAY = "ONCE_A_DAY",
  THRICE_A_DAY = "THRICE_A_DAY",
  TWICE_A_DAY = "TWICE_A_DAY",
}

export enum MEDICINE_TIMINGS {
  AS_NEEDED = "AS_NEEDED",
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
  BOTTLE = "BOTTLE",
  CAPSULE = "CAPSULE",
  CREAM = "CREAM",
  DROPS = "DROPS",
  GEL = "GEL",
  INJECTION = "INJECTION",
  LOTION = "LOTION",
  ML = "ML",
  NA = "NA",
  OINTMENT = "OINTMENT",
  OTHERS = "OTHERS",
  POWDER = "POWDER",
  ROTACAPS = "ROTACAPS",
  SACHET = "SACHET",
  SOAP = "SOAP",
  SOLUTION = "SOLUTION",
  SPRAY = "SPRAY",
  SUSPENSION = "SUSPENSION",
  SYRUP = "SYRUP",
  TABLET = "TABLET",
}

export enum OTP_STATUS {
  BLOCKED = "BLOCKED",
  EXPIRED = "EXPIRED",
  NOT_VERIFIED = "NOT_VERIFIED",
  VERIFIED = "VERIFIED",
}

export enum REQUEST_ROLES {
  DOCTOR = "DOCTOR",
  JUNIOR = "JUNIOR",
  PATIENT = "PATIENT",
}

export enum Relation {
  BROTHER = "BROTHER",
  COUSIN = "COUSIN",
  DAUGHTER = "DAUGHTER",
  FATHER = "FATHER",
  GRANDDAUGHTER = "GRANDDAUGHTER",
  GRANDFATHER = "GRANDFATHER",
  GRANDMOTHER = "GRANDMOTHER",
  GRANDSON = "GRANDSON",
  HUSBAND = "HUSBAND",
  ME = "ME",
  MOTHER = "MOTHER",
  OTHER = "OTHER",
  SISTER = "SISTER",
  SON = "SON",
  WIFE = "WIFE",
}

export enum STATUS {
  CALL_ABANDON = "CALL_ABANDON",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  JUNIOR_DOCTOR_ENDED = "JUNIOR_DOCTOR_ENDED",
  JUNIOR_DOCTOR_STARTED = "JUNIOR_DOCTOR_STARTED",
  NO_SHOW = "NO_SHOW",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PENDING = "PENDING",
  UNAVAILABLE_MEDMANTRA = "UNAVAILABLE_MEDMANTRA",
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

export interface BlockMultipleItems {
  doctorId: string;
  reason?: string | null;
  itemDetails?: (CalendarItem | null)[] | null;
}

export interface CalendarItem {
  start: any;
  end: any;
  consultMode?: ConsultMode | null;
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

export interface DoctorAvailabilityInput {
  availableDate: any;
  doctorId: string;
}

export interface DoctorNextAvailableSlotInput {
  availableDate: any;
  doctorIds: string[];
  availableType?: APPOINTMENT_TYPE | null;
  currentTimeInput?: any | null;
}

export interface DownloadDocumentsInput {
  fileIds: string[];
  patientId: string;
}

export interface EndAppointmentSessionInput {
  appointmentId: string;
  status: STATUS;
  noShowBy?: REQUEST_ROLES | null;
}

export interface MedicinePrescriptionInput {
  id?: string | null;
  medicineConsumptionDuration?: string | null;
  medicineConsumptionDurationInDays?: string | null;
  medicineConsumptionDurationUnit?: MEDICINE_CONSUMPTION_DURATION | null;
  medicineDosage?: string | null;
  medicineFormTypes?: MEDICINE_FORM_TYPES | null;
  medicineFrequency?: MEDICINE_FREQUENCY | null;
  medicineInstructions?: string | null;
  medicineName?: string | null;
  medicineTimings?: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken?: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineUnit?: MEDICINE_UNIT | null;
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

export interface OtpVerificationInput {
  id: string;
  otp: string;
  loginType: LOGIN_TYPE;
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

export interface SaveDoctorsFavouriteMedicineInput {
  externalId?: string | null;
  medicineConsumptionDuration?: string | null;
  medicineConsumptionDurationInDays: number;
  medicineConsumptionDurationUnit?: MEDICINE_CONSUMPTION_DURATION | null;
  medicineDosage: string;
  medicineFormTypes?: MEDICINE_FORM_TYPES | null;
  medicineFrequency?: MEDICINE_FREQUENCY | null;
  medicineInstructions?: string | null;
  medicineName: string;
  medicineTimings: (MEDICINE_TIMINGS | null)[];
  medicineToBeTaken?: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineUnit: MEDICINE_UNIT;
}

export interface SymptomInput {
  symptom?: string | null;
  since?: string | null;
  howOften?: string | null;
  severity?: string | null;
  details?: string | null;
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

export interface UpdateDoctorsFavouriteMedicineInput {
  externalId?: string | null;
  id: string;
  medicineConsumptionDuration?: string | null;
  medicineConsumptionDurationInDays?: number | null;
  medicineConsumptionDurationUnit?: MEDICINE_CONSUMPTION_DURATION | null;
  medicineDosage?: string | null;
  medicineFormTypes?: MEDICINE_FORM_TYPES | null;
  medicineFrequency?: MEDICINE_FREQUENCY | null;
  medicineInstructions?: string | null;
  medicineName: string;
  medicineTimings: (MEDICINE_TIMINGS | null)[];
  medicineToBeTaken?: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineUnit?: MEDICINE_UNIT | null;
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
  referralCode?: string | null;
  relation?: Relation | null;
  photoUrl?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
