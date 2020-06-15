/* tslint:disable */
/* eslint-disable */
// @generated
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

export enum BOOKINGSOURCE {
  MOBILE = "MOBILE",
  WEB = "WEB",
}

export enum BOOKING_SOURCE {
  MOBILE = "MOBILE",
  WEB = "WEB",
}

export enum CONSULTS_RX_SEARCH_FILTER {
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
  PRESCRIPTION = "PRESCRIPTION",
}

export enum DEVICETYPE {
  ANDROID = "ANDROID",
  DESKTOP = "DESKTOP",
  IOS = "IOS",
}

export enum DEVICE_TYPE {
  ANDROID = "ANDROID",
  IOS = "IOS",
}

export enum DIAGNOSTICS_TYPE {
  PACKAGE = "PACKAGE",
  TEST = "TEST",
}

export enum DIAGNOSTIC_ORDER_PAYMENT_TYPE {
  COD = "COD",
  ONLINE_PAYMENT = "ONLINE_PAYMENT",
}

export enum DIAGNOSTIC_ORDER_STATUS {
  ORDER_CANCELLED = "ORDER_CANCELLED",
  ORDER_FAILED = "ORDER_FAILED",
  ORDER_PLACED = "ORDER_PLACED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PICKUP_CONFIRMED = "PICKUP_CONFIRMED",
  PICKUP_REQUESTED = "PICKUP_REQUESTED",
}

export enum DiscountType {
  FLATPRICE = "FLATPRICE",
  PERCENT = "PERCENT",
  PRICEOFF = "PRICEOFF",
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

export enum MEDICINE_CONSUMPTION_DURATION {
  DAYS = "DAYS",
  MONTHS = "MONTHS",
  WEEKS = "WEEKS",
}

export enum MEDICINE_DELIVERY_TYPE {
  HOME_DELIVERY = "HOME_DELIVERY",
  STORE_PICKUP = "STORE_PICKUP",
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

export enum MEDICINE_ORDER_PAYMENT_TYPE {
  CASHLESS = "CASHLESS",
  COD = "COD",
  NO_PAYMENT = "NO_PAYMENT",
}

export enum MEDICINE_ORDER_STATUS {
  CANCELLED = "CANCELLED",
  CANCEL_REQUEST = "CANCEL_REQUEST",
  DELIVERED = "DELIVERED",
  ITEMS_RETURNED = "ITEMS_RETURNED",
  ORDER_BILLED = "ORDER_BILLED",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_FAILED = "ORDER_FAILED",
  ORDER_INITIATED = "ORDER_INITIATED",
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_VERIFIED = "ORDER_VERIFIED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PICKEDUP = "PICKEDUP",
  PRESCRIPTION_CART_READY = "PRESCRIPTION_CART_READY",
  PRESCRIPTION_UPLOADED = "PRESCRIPTION_UPLOADED",
  QUOTE = "QUOTE",
  READY_AT_STORE = "READY_AT_STORE",
  RETURN_ACCEPTED = "RETURN_ACCEPTED",
  RETURN_INITIATED = "RETURN_INITIATED",
}

export enum MEDICINE_ORDER_TYPE {
  CART_ORDER = "CART_ORDER",
  UPLOAD_PRESCRIPTION = "UPLOAD_PRESCRIPTION",
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

export enum MedicalRecordType {
  CONSULTATION = "CONSULTATION",
  EHR = "EHR",
  OPERATIVE_REPORT = "OPERATIVE_REPORT",
  PATHOLOGY_REPORT = "PATHOLOGY_REPORT",
  PHYSICAL_EXAMINATION = "PHYSICAL_EXAMINATION",
  PRESCRIPTION = "PRESCRIPTION",
  TEST_REPORT = "TEST_REPORT",
}

export enum MedicalTestUnit {
  GM = "GM",
  GM_SLASH_DL = "GM_SLASH_DL",
  NONE = "NONE",
  _PERCENT_ = "_PERCENT_",
}

export enum NonCartOrderCity {
  CHENNAI = "CHENNAI",
}

export enum PRISM_DOCUMENT_CATEGORY {
  HealthChecks = "HealthChecks",
  OpSummary = "OpSummary",
  TestReports = "TestReports",
}

export enum REQUEST_ROLES {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  JUNIOR = "JUNIOR",
  PATIENT = "PATIENT",
  SYSTEM = "SYSTEM",
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

export enum TEST_COLLECTION_TYPE {
  CENTER = "CENTER",
  HC = "HC",
}

export enum TRANSFER_INITIATED_TYPE {
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
}

export enum UPLOAD_FILE_TYPES {
  JPEG = "JPEG",
  JPG = "JPG",
  PDF = "PDF",
  PNG = "PNG",
}

export interface AddMedicalRecordInput {
  additionalNotes?: string | null;
  documentURLs?: string | null;
  issuingDoctor?: string | null;
  location?: string | null;
  medicalRecordParameters?: (AddMedicalRecordParametersInput | null)[] | null;
  observations?: string | null;
  patientId: string;
  prismFileIds?: string | null;
  recordType?: MedicalRecordType | null;
  referringDoctor?: string | null;
  sourceName?: string | null;
  testDate?: any | null;
  testName: string;
}

export interface AddMedicalRecordParametersInput {
  maximum?: number | null;
  minimum?: number | null;
  parameterName?: string | null;
  result?: number | null;
  unit?: MedicalTestUnit | null;
}

export interface BookRescheduleAppointmentInput {
  appointmentId: string;
  doctorId: string;
  newDateTimeslot: any;
  initiatedBy: TRANSFER_INITIATED_TYPE;
  initiatedId: string;
  patientId: string;
  rescheduledId?: string | null;
}

export interface CancelAppointmentInput {
  appointmentId: string;
  cancelReason?: string | null;
  cancelledBy: REQUEST_ROLES;
  cancelledById: string;
}

export interface DiagnosticLineItem {
  itemId?: number | null;
  price?: number | null;
  quantity?: number | null;
}

export interface DiagnosticOrderInput {
  patientId: string;
  patientAddressId: string;
  city: string;
  cityId: string;
  state: string;
  stateId: string;
  slotTimings: string;
  employeeSlotId: number;
  diagnosticEmployeeCode: string;
  diagnosticBranchCode: string;
  totalPrice: number;
  prescriptionUrl: string;
  diagnosticDate: any;
  centerName: string;
  centerCode: string;
  centerCity: string;
  centerState: string;
  centerLocality: string;
  bookingSource?: BOOKINGSOURCE | null;
  deviceType?: DEVICETYPE | null;
  paymentType?: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  items?: (DiagnosticLineItem | null)[] | null;
}

export interface DownloadDocumentsInput {
  fileIds: string[];
  patientId: string;
}

export interface EditProfileInput {
  firstName: string;
  lastName: string;
  dateOfBirth: any;
  gender: Gender;
  relation: Relation;
  emailAddress: string;
  photoUrl: string;
  id: string;
}

export interface HelpEmailInput {
  category?: string | null;
  reason?: string | null;
  comments?: string | null;
  patientId?: string | null;
  email?: string | null;
}

export interface OrderCancelInput {
  orderNo?: number | null;
  remarksCode?: string | null;
}

export interface OtpVerificationInput {
  id: string;
  otp: string;
  loginType: LOGIN_TYPE;
}

export interface PatientConsultsAndOrdersInput {
  patient: string;
  filter?: CONSULTS_RX_SEARCH_FILTER[] | null;
  offset?: number | null;
  limit?: number | null;
}

export interface PatientProfileInput {
  firstName: string;
  lastName: string;
  dateOfBirth: any;
  gender: Gender;
  relation: Relation;
  emailAddress: string;
  photoUrl: string;
  mobileNumber: string;
}

export interface PrescriptionMedicineInput {
  quoteId?: string | null;
  shopId?: string | null;
  patientId: string;
  bookingSource?: BOOKING_SOURCE | null;
  deviceType?: DEVICE_TYPE | null;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patinetAddressId?: string | null;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  appointmentId?: string | null;
  isEprescription?: number | null;
  payment?: PrescriptionMedicinePaymentDetails | null;
  email?: string | null;
  NonCartOrderCity?: NonCartOrderCity | null;
  orderAutoId?: number | null;
}

export interface PrescriptionMedicinePaymentDetails {
  paymentType?: MEDICINE_ORDER_PAYMENT_TYPE | null;
  amountPaid?: number | null;
  paymentRefId?: string | null;
  paymentStatus?: string | null;
  paymentDateTime?: any | null;
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

export interface UploadDocumentInput {
  fileType: UPLOAD_FILE_TYPES;
  base64FileInput: string;
  patientId: string;
  category: PRISM_DOCUMENT_CATEGORY;
}

//==============================================================
// END Enums and Input Objects
//==============================================================