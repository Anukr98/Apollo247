/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

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

export enum DOCTOR_ONLINE_STATUS {
  AWAY = "AWAY",
  ONLINE = "ONLINE",
}

export enum DoctorType {
  APOLLO = "APOLLO",
  CLINIC = "CLINIC",
  CRADLE = "CRADLE",
  DOCTOR_CONNECT = "DOCTOR_CONNECT",
  FERTILITY = "FERTILITY",
  JUNIOR = "JUNIOR",
  PAYROLL = "PAYROLL",
  SPECTRA = "SPECTRA",
  STAR_APOLLO = "STAR_APOLLO",
  SUGAR = "SUGAR",
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

export enum LoggedInUserType {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  JDADMIN = "JDADMIN",
  JUNIOR = "JUNIOR",
  SECRETARY = "SECRETARY",
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
  ALTERNATE_DAY = "ALTERNATE_DAY",
  AS_NEEDED = "AS_NEEDED",
  EVERY_FOUR_HOURS = "EVERY_FOUR_HOURS",
  EVERY_HOUR = "EVERY_HOUR",
  EVERY_TWO_HOURS = "EVERY_TWO_HOURS",
  FIVE_TIMES_A_DAY = "FIVE_TIMES_A_DAY",
  FOUR_TIMES_A_DAY = "FOUR_TIMES_A_DAY",
  ONCE_A_DAY = "ONCE_A_DAY",
  ONCE_A_MONTH = "ONCE_A_MONTH",
  ONCE_A_WEEK = "ONCE_A_WEEK",
  ONCE_IN_15_DAYS = "ONCE_IN_15_DAYS",
  STAT = "STAT",
  THREE_TIMES_A_WEEK = "THREE_TIMES_A_WEEK",
  THRICE_A_DAY = "THRICE_A_DAY",
  TWICE_A_DAY = "TWICE_A_DAY",
  TWICE_A_WEEK = "TWICE_A_WEEK",
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
  AS_PRESCRIBED = "AS_PRESCRIBED",
  BOTTLE = "BOTTLE",
  CAPSULE = "CAPSULE",
  CREAM = "CREAM",
  DROP = "DROP",
  GEL = "GEL",
  GM = "GM",
  INJECTION = "INJECTION",
  LOTION = "LOTION",
  MG = "MG",
  ML = "ML",
  NA = "NA",
  OINTMENT = "OINTMENT",
  OTHERS = "OTHERS",
  PATCH = "PATCH",
  POWDER = "POWDER",
  PUFF = "PUFF",
  ROTACAPS = "ROTACAPS",
  SACHET = "SACHET",
  SOAP = "SOAP",
  SOLUTION = "SOLUTION",
  SPRAY = "SPRAY",
  SUSPENSION = "SUSPENSION",
  SYRUP = "SYRUP",
  TABLET = "TABLET",
  UNIT = "UNIT",
}

export enum REQUEST_ROLES {
  DOCTOR = "DOCTOR",
  JUNIOR = "JUNIOR",
  PATIENT = "PATIENT",
}

export enum ROUTE_OF_ADMINISTRATION {
  EAR_DROPS = "EAR_DROPS",
  EYE_DROPS = "EYE_DROPS",
  GARGLE = "GARGLE",
  INHALE = "INHALE",
  INTRAMUSCULAR = "INTRAMUSCULAR",
  INTRAVAGINAL = "INTRAVAGINAL",
  INTRAVENOUS = "INTRAVENOUS",
  LOCAL_APPLICATION = "LOCAL_APPLICATION",
  NASAL_DROPS = "NASAL_DROPS",
  ORALLY = "ORALLY",
  ORAL_DROPS = "ORAL_DROPS",
  PER_RECTAL = "PER_RECTAL",
  SUBCUTANEOUS = "SUBCUTANEOUS",
  SUBLINGUAL = "SUBLINGUAL",
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
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_PENDING_PG = "PAYMENT_PENDING_PG",
  PENDING = "PENDING",
  UNAVAILABLE_MEDMANTRA = "UNAVAILABLE_MEDMANTRA",
}

export enum Salutation {
  DR = "DR",
  MR = "MR",
  MRS = "MRS",
  MS = "MS",
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

export enum notificationEventName {
  APPOINTMENT = "APPOINTMENT",
}

export enum notificationStatus {
  READ = "READ",
  UNREAD = "UNREAD",
}

export enum notificationType {
  CHAT = "CHAT",
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

export interface CancelAppointmentInput {
  appointmentId: string;
  cancelReason?: string | null;
  cancelledBy: REQUEST_ROLES;
  cancelledById: string;
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
  routeOfAdministration?: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage?: string | null;
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
  medicationHistory?: string | null;
  occupationHistory?: string | null;
  referralSpecialtyName?: string | null;
  referralDescription?: string | null;
}

export interface OtherInstructionsInput {
  instruction?: string | null;
}

export interface OtpVerificationInput {
  id: string;
  otp: string;
  loginType: LOGIN_TYPE;
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
  routeOfAdministration?: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage?: string | null;
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
  routeOfAdministration?: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage?: string | null;
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
  deviceCode?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
