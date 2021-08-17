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

export enum APPT_CALL_TYPE {
  AUDIO = "AUDIO",
  CHAT = "CHAT",
  VIDEO = "VIDEO",
}

export enum AccountType {
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS",
}

export enum AllergySeverity {
  LIFE_THREATENING = "LIFE_THREATENING",
  MILD = "MILD",
  NOT_KNOWN = "NOT_KNOWN",
  SEVERE = "SEVERE",
}

export enum AppointmentType {
  BOTH = "BOTH",
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum BOOKINGSOURCE {
  BOOKING_TOOL = "BOOKING_TOOL",
  MOBILE = "MOBILE",
  WEB = "WEB",
}

export enum BOOKING_SOURCE {
  AP_IN = "AP_IN",
  BOOKING_TOOL = "BOOKING_TOOL",
  MFINE = "MFINE",
  MOBILE = "MOBILE",
  ORDER_PUNCHING_TOOL = "ORDER_PUNCHING_TOOL",
  WEB = "WEB",
}

export enum BannerDisplayType {
  banner = "banner",
  card = "card",
}

export enum BloodGroups {
  ABNegative = "ABNegative",
  ABPositive = "ABPositive",
  ANegative = "ANegative",
  APositive = "APositive",
  BNegative = "BNegative",
  BPositive = "BPositive",
  ONegative = "ONegative",
  OPositive = "OPositive",
}

export enum BookingSource {
  Apollo247_Android = 'Apollo247_Android',
  Apollo247_Ios = 'Apollo247_Ios',
  Apollo247_Web = 'Apollo247_Web',
}

export enum BookingStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  INPROGRESS = 'INPROGRESS',
}

export enum CODCity {
  CHENNAI = "CHENNAI",
}

export enum CONSULTS_RX_SEARCH_FILTER {
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
  PRESCRIPTION = "PRESCRIPTION",
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

export enum CouponCategoryApplicable {
  FMCG = "FMCG",
  PHARMA = "PHARMA",
  PHARMA_FMCG = "PHARMA_FMCG",
  PL = "PL",
}

export enum CustomerType {
  FIRST = "FIRST",
  RECURRING = "RECURRING",
}

export enum DEVICETYPE {
  ANDROID = "ANDROID",
  DESKTOP = "DESKTOP",
  IOS = "IOS",
}

export enum DEVICE_TYPE {
  ANDROID = "ANDROID",
  DESKTOP = "DESKTOP",
  IOS = "IOS",
  MWEB = "MWEB",
  WEB = "WEB",
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
  ORDER_CANCELLED_REQUEST = "ORDER_CANCELLED_REQUEST",
  ORDER_COMPLETED = "ORDER_COMPLETED",
  ORDER_FAILED = "ORDER_FAILED",
  ORDER_INITIATED = "ORDER_INITIATED",
  ORDER_MODIFIED = "ORDER_MODIFIED",
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_RESCHEDULED = "ORDER_RESCHEDULED",
  ORDER_RESCHEDULED_REQUEST = "ORDER_RESCHEDULED_REQUEST",
  PARTIAL_ORDER_COMPLETED = "PARTIAL_ORDER_COMPLETED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_SUCCESSFUL = "PAYMENT_SUCCESSFUL",
  PHLEBO_CHECK_IN = "PHLEBO_CHECK_IN",
  PHLEBO_COMPLETED = "PHLEBO_COMPLETED",
  PICKUP_CONFIRMED = "PICKUP_CONFIRMED",
  PICKUP_REQUESTED = "PICKUP_REQUESTED",
  REPORT_GENERATED = "REPORT_GENERATED",
  SAMPLE_COLLECTED = "SAMPLE_COLLECTED",
  SAMPLE_COLLECTED_IN_LAB = "SAMPLE_COLLECTED_IN_LAB",
  SAMPLE_NOT_COLLECTED_IN_LAB = "SAMPLE_NOT_COLLECTED_IN_LAB",
  SAMPLE_RECEIVED_IN_LAB = "SAMPLE_RECEIVED_IN_LAB",
  SAMPLE_REJECTED_IN_LAB = "SAMPLE_REJECTED_IN_LAB",
  SAMPLE_SUBMITTED = "SAMPLE_SUBMITTED",
  SAMPLE_TESTED = "SAMPLE_TESTED",
}

export enum DOCTOR_ONLINE_STATUS {
  AWAY = "AWAY",
  ONLINE = "ONLINE",
}

export interface CowinLoginVerifyInput {
  operationType: OperationType;
  mobileNumber: string;
  otp?: string | null;
  txnId?: string | null;
}

export interface GetCowinBeneficiaryInput {
  mobileNumber: string;
}

export enum OperationType {
  GENERATE_OTP = 'GENERATE_OTP',
  VERIFY_OTP = 'VERIFY_OTP',
}

export enum DiagnosticsBookingSource {
  MOBILE = "MOBILE",
  OP_CALL_CENTER = "OP_CALL_CENTER",
  OP_OMT_TEAM = "OP_OMT_TEAM",
  OP_WHATSAPP = "OP_WHATSAPP",
  WEB = "WEB",
}

export interface DiagnosticsServiceability {
  cityID?: number | null;
  stateID?: number | null;
}

export enum DiagnosticsRescheduleSource {
  AD = "AD",
  MOBILE = "MOBILE",
  OPS_DASHBOARD = "OPS_DASHBOARD",
  WEB = "WEB",
}

export enum DiscountType {
  FLATPRICE = "FLATPRICE",
  PERCENT = "PERCENT",
  PRICEOFF = "PRICEOFF",
}

export enum DoctorType {
  APOLLO = "APOLLO",
  APOLLO_HOMECARE = "APOLLO_HOMECARE",
  CLINIC = "CLINIC",
  CRADLE = "CRADLE",
  DOCTOR_CONNECT = "DOCTOR_CONNECT",
  FERTILITY = "FERTILITY",
  JUNIOR = "JUNIOR",
  PAYROLL = "PAYROLL",
  SPECTRA = "SPECTRA",
  STAR_APOLLO = "STAR_APOLLO",
  SUGAR = "SUGAR",
  WHITE_DENTAL = "WHITE_DENTAL",
}

export enum FEEDBACKTYPE {
  CONSULT = "CONSULT",
  DIAGNOSTICS = "DIAGNOSTICS",
  PHARMACY = "PHARMACY",
}

export enum GENDER {
  ALL = 'ALL',
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  OTHER = 'OTHER',
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
}

export enum HDFC_CUSTOMER {
  NOT_HDFC_CUSTOMER = "NOT_HDFC_CUSTOMER",
  OTP_GENERATED = "OTP_GENERATED",
  OTP_NOT_GENERATED = "OTP_NOT_GENERATED",
}

export enum HELP_DESK_TICKET_STATUS {
  Open = "Open",
}

export enum HealthRestrictionNature {
  Dietary = "Dietary",
  OTHER = "OTHER",
  Physical = "Physical",
}

export enum LOGIN_TYPE {
  DOCTOR = "DOCTOR",
  EMAIL = "EMAIL",
  PATIENT = "PATIENT",
}

export enum MEDICINE_CONSUMPTION_DURATION {
  DAYS = "DAYS",
  MONTHS = "MONTHS",
  TILL_NEXT_REVIEW = "TILL_NEXT_REVIEW",
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
  CONSULT_CANCELLED = "CONSULT_CANCELLED",
  CONSULT_COMPLETED = "CONSULT_COMPLETED",
  CONSULT_PENDING = "CONSULT_PENDING",
  DELIVERED = "DELIVERED",
  DELIVERY_ATTEMPTED = "DELIVERY_ATTEMPTED",
  ITEMS_RETURNED = "ITEMS_RETURNED",
  ON_HOLD = "ON_HOLD",
  ORDER_BILLED = "ORDER_BILLED",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_FAILED = "ORDER_FAILED",
  ORDER_INITIATED = "ORDER_INITIATED",
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_VERIFIED = "ORDER_VERIFIED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  PAYMENT_ABORTED = "PAYMENT_ABORTED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PICKEDUP = "PICKEDUP",
  PRESCRIPTION_CART_READY = "PRESCRIPTION_CART_READY",
  PRESCRIPTION_UPLOADED = "PRESCRIPTION_UPLOADED",
  PURCHASED_IN_STORE = "PURCHASED_IN_STORE",
  QUOTE = "QUOTE",
  READY_AT_STORE = "READY_AT_STORE",
  READY_FOR_VERIFICATION = "READY_FOR_VERIFICATION",
  READY_TO_SHIP = "READY_TO_SHIP",
  RETURN_ACCEPTED = "RETURN_ACCEPTED",
  RETURN_INITIATED = "RETURN_INITIATED",
  RETURN_PENDING = "RETURN_PENDING",
  RETURN_PICKUP = "RETURN_PICKUP",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  RETURN_REQUEST_CREATED = "RETURN_REQUEST_CREATED",
  RETURN_RTO = "RETURN_RTO",
  RETURN_TO_ORIGIN = "RETURN_TO_ORIGIN",
  RVP_ASSIGNED = "RVP_ASSIGNED",
  SHIPPED = "SHIPPED",
  VERIFICATION_DONE = "VERIFICATION_DONE",
}

export enum MEDICINE_ORDER_STATUS_CONSULT {
  CANCELLED = "CANCELLED",
  CANCEL_REQUEST = "CANCEL_REQUEST",
  CONSULT_CANCELLED = "CONSULT_CANCELLED",
  CONSULT_COMPLETED = "CONSULT_COMPLETED",
  CONSULT_PENDING = "CONSULT_PENDING",
  DELIVERED = "DELIVERED",
  DELIVERY_ATTEMPTED = "DELIVERY_ATTEMPTED",
  ITEMS_RETURNED = "ITEMS_RETURNED",
  ON_HOLD = "ON_HOLD",
  ORDER_BILLED = "ORDER_BILLED",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_FAILED = "ORDER_FAILED",
  ORDER_INITIATED = "ORDER_INITIATED",
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_VERIFIED = "ORDER_VERIFIED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  PAYMENT_ABORTED = "PAYMENT_ABORTED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PICKEDUP = "PICKEDUP",
  PRESCRIPTION_CART_READY = "PRESCRIPTION_CART_READY",
  PRESCRIPTION_UPLOADED = "PRESCRIPTION_UPLOADED",
  PURCHASED_IN_STORE = "PURCHASED_IN_STORE",
  QUOTE = "QUOTE",
  READY_AT_STORE = "READY_AT_STORE",
  READY_FOR_VERIFICATION = "READY_FOR_VERIFICATION",
  READY_TO_SHIP = "READY_TO_SHIP",
  RETURN_ACCEPTED = "RETURN_ACCEPTED",
  RETURN_INITIATED = "RETURN_INITIATED",
  RETURN_PENDING = "RETURN_PENDING",
  RETURN_PICKUP = "RETURN_PICKUP",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  RETURN_RTO = "RETURN_RTO",
  RETURN_TO_ORIGIN = "RETURN_TO_ORIGIN",
  RVP_ASSIGNED = "RVP_ASSIGNED",
  SHIPPED = "SHIPPED",
  VERIFICATION_DONE = "VERIFICATION_DONE",
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
  NOT_SPECIFIC = "NOT_SPECIFIC",
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
  DROPS = "DROPS",
  GEL = "GEL",
  GM = "GM",
  INJECTION = "INJECTION",
  INTERNATIONAL_UNIT = "INTERNATIONAL_UNIT",
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
  TEASPOON = "TEASPOON",
  UNIT = "UNIT",
}

export enum MedicalConditionIllnessTypes {
  Acute = "Acute",
  Chronic = "Chronic",
  Intermittent = "Intermittent",
  Recurring = "Recurring",
}

export enum MedicalRecordType {
  ALLERGY = "ALLERGY",
  CONSULTATION = "CONSULTATION",
  EHR = "EHR",
  FAMILY_HISTORY = "FAMILY_HISTORY",
  HEALTHCHECK = "HEALTHCHECK",
  HEALTHRESTRICTION = "HEALTHRESTRICTION",
  HOSPITALIZATION = "HOSPITALIZATION",
  IMMUNIZATION = "IMMUNIZATION",
  MEDICALBILL = "MEDICALBILL",
  MEDICALCONDITION = "MEDICALCONDITION",
  MEDICALINSURANCE = "MEDICALINSURANCE",
  MEDICATION = "MEDICATION",
  OPERATIVE_REPORT = "OPERATIVE_REPORT",
  PATHOLOGY_REPORT = "PATHOLOGY_REPORT",
  PHYSICAL_EXAMINATION = "PHYSICAL_EXAMINATION",
  PRESCRIPTION = "PRESCRIPTION",
  TEST_REPORT = "TEST_REPORT",
}

export enum NonCartOrderOMSCity {
  CHENNAI = "CHENNAI",
}

export enum ONEAPOLLO_STORECODE {
  ANDCUS = "ANDCUS",
  IOSCUS = "IOSCUS",
  WEBCUS = "WEBCUS",
}

export enum ONE_APOLLO_STORE_CODE {
  ANDCUS = "ANDCUS",
  IOSCUS = "IOSCUS",
  WEBCUS = "WEBCUS",
}

export enum ORDER_REQUEST_TYPE {
  CONSULT = "CONSULT",
  DIAGNOSTICS = "DIAGNOSTICS",
  PHARMACY = "PHARMACY",
}

export enum ORDER_TYPE {
  CONSULT = "CONSULT",
  DIAGNOSTICS = "DIAGNOSTICS",
  PHARMACY = "PHARMACY",
}

export enum OTP_STATUS {
  BLOCKED = "BLOCKED",
  EXPIRED = "EXPIRED",
  NOT_VERIFIED = "NOT_VERIFIED",
  VERIFIED = "VERIFIED",
}

export enum PATIENT_ADDRESS_TYPE {
  HOME = "HOME",
  OFFICE = "OFFICE",
  OTHER = "OTHER",
}

export enum PAYMENT_METHODS {
  CC = "CC",
  COD = "COD",
  DC = "DC",
  EMI = "EMI",
  NB = "NB",
  PAYTMCC = "PAYTMCC",
  PPI = "PPI",
  UPI = "UPI",
}

export enum PAYMENT_METHODS_JUSPAY {
  CARD = "CARD",
  COD = "COD",
  HEALTH_CREDITS = "HEALTH_CREDITS",
  NB = "NB",
  UPI = "UPI",
  WALLET = "WALLET",
}

export enum PAYMENT_METHODS_REVERSE {
  COD = "COD",
  CREDIT_CARD = "CREDIT_CARD",
  CREDIT_CARD_EMI = "CREDIT_CARD_EMI",
  DEBIT_CARD = "DEBIT_CARD",
  NET_BANKING = "NET_BANKING",
  PAYTM_POSTPAID = "PAYTM_POSTPAID",
  PAYTM_WALLET = "PAYTM_WALLET",
  UPI = "UPI",
}

export enum PAYMENT_STATUS {
  AUTO_REFUNDED = "AUTO_REFUNDED",
  COD_COMPLETE = "COD_COMPLETE",
  PAYMENT_NOT_INITIATED = "PAYMENT_NOT_INITIATED",
  PENDING = "PENDING",
  TXN_FAILURE = "TXN_FAILURE",
  TXN_SUCCESS = "TXN_SUCCESS",
}

export enum PHARMACY_USER_TYPE {
  NEW = "NEW",
  REPEAT = "REPEAT",
}

export enum PLAN {
  ALL = "ALL",
  CARE_PLAN = "CARE_PLAN",
}

export enum PLAN_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum PRISM_DOCUMENT_CATEGORY {
  HealthChecks = "HealthChecks",
  OpSummary = "OpSummary",
  TestReports = "TestReports",
}

export enum PaymentStatus {
  INVALID_PAYMENT = "INVALID_PAYMENT",
  PENDING = "PENDING",
  TXN_FAILURE = "TXN_FAILURE",
  TXN_SUCCESS = "TXN_SUCCESS",
}

export enum PharmaDiscountApplicableOn {
  MRP = "MRP",
  SPECIAL_PRICE = "SPECIAL_PRICE",
}

export enum PlanPurchaseType {
  first_time = "first_time",
  renew = "renew",
}

export enum PrescriptionType {
  CONSULT = "CONSULT",
  LATER = "LATER",
  NA = "NA",
  UPLOADED = "UPLOADED",
}

export enum REFUND_STATUS {
  REFUND_FAILED = "REFUND_FAILED",
  REFUND_REQUEST_NOT_RAISED = "REFUND_REQUEST_NOT_RAISED",
  REFUND_REQUEST_RAISED = "REFUND_REQUEST_RAISED",
  REFUND_SUCCESSFUL = "REFUND_SUCCESSFUL",
}

export enum REFUND_STATUSES {
  FAILURE = "FAILURE",
  MANUAL_REVIEW = "MANUAL_REVIEW",
  PENDING = "PENDING",
  REFUND_REQUEST_NOT_SENT = "REFUND_REQUEST_NOT_SENT",
  SUCCESS = "SUCCESS",
}

export enum REQUEST_ROLES {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  JUNIOR = "JUNIOR",
  PATIENT = "PATIENT",
  SECRETARY = "SECRETARY",
  SYSTEM = "SYSTEM",
}

export enum ROUTE_OF_ADMINISTRATION {
  EAR_DROPS = "EAR_DROPS",
  EYE_DROPS = "EYE_DROPS",
  EYE_OINTMENT = "EYE_OINTMENT",
  GARGLE = "GARGLE",
  INHALE = "INHALE",
  INTRAMUSCULAR = "INTRAMUSCULAR",
  INTRANASAL_SPRAY = "INTRANASAL_SPRAY",
  INTRAVAGINAL = "INTRAVAGINAL",
  INTRAVENOUS = "INTRAVENOUS",
  INTRA_ARTICULAR = "INTRA_ARTICULAR",
  LOCAL_APPLICATION = "LOCAL_APPLICATION",
  NASALLY = "NASALLY",
  NASAL_DROPS = "NASAL_DROPS",
  ORALLY = "ORALLY",
  ORAL_DROPS = "ORAL_DROPS",
  PER_RECTAL = "PER_RECTAL",
  SUBCUTANEOUS = "SUBCUTANEOUS",
  SUBLINGUAL = "SUBLINGUAL",
  TRIGGER_POINT_INJECTION = "TRIGGER_POINT_INJECTION",
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

export enum SEARCH_TYPE {
  DOCTOR = "DOCTOR",
  MEDICINE = "MEDICINE",
  SPECIALTY = "SPECIALTY",
  TEST = "TEST",
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
  PAYMENT_ABORTED = "PAYMENT_ABORTED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_PENDING_PG = "PAYMENT_PENDING_PG",
  PENDING = "PENDING",
  UNAVAILABLE_MEDMANTRA = "UNAVAILABLE_MEDMANTRA",
}

export enum SpecialtySearchType {
  ID = "ID",
  NAME = "NAME",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  DEFERRED_ACTIVE = "DEFERRED_ACTIVE",
  DEFERRED_INACTIVE = "DEFERRED_INACTIVE",
  DISABLED = "DISABLED",
  PARTIAL_PAYMENT = "PARTIAL_PAYMENT",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  UPGRADED = "UPGRADED",
}

export enum TEST_COLLECTION_TYPE {
  CENTER = "CENTER",
  HC = "HC",
}

export enum TRANSFER_INITIATED_TYPE {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
  SECRETARY = "SECRETARY",
}

export enum TRANSFER_STATUS {
  COMPLETED = "COMPLETED",
  INITIATED = "INITIATED",
  REJECTED = "REJECTED",
}

export enum UPLOAD_FILE_TYPES {
  JPEG = "JPEG",
  JPG = "JPG",
  PDF = "PDF",
  PNG = "PNG",
}

export enum USER_STATUS {
  ENTERING = "ENTERING",
  LEAVING = "LEAVING",
}

export enum USER_TYPE {
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
}

export enum UserState {
  LOGGED_IN = "LOGGED_IN",
  LOGGED_OUT = "LOGGED_OUT",
}

export enum VERTICALS {
  consult = "consult",
  diagnostics = "diagnostics",
  pharma = "pharma",
  subscription = "subscription",
  vaccination = "vaccination",
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

export enum ZoneType {
  CITY = "CITY",
  STATE = "STATE",
}

export enum docOnCallType {
  CIRCLE = "CIRCLE",
  COVID_VACCINATION_QUERY = "COVID_VACCINATION_QUERY",
  HDFC = "HDFC",
}

export enum mediaPrescriptionSource {
  EPRESCRIPTION = "EPRESCRIPTION",
  SELF = "SELF",
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

export enum one_apollo_store_code {
  ANDCUS = "ANDCUS",
  IOSCUS = "IOSCUS",
  WEBCUS = "WEBCUS",
}

export interface AddAllergyRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  allergyName: string;
  severity: AllergySeverity;
  startDate: any;
  endDate?: any | null;
  doctorTreated?: string | null;
  reactionToAllergy?: string | null;
  notes?: string | null;
  attachmentList?: (AllergyFileProperties | null)[] | null;
}

export interface AddCommentHelpdeskTicketInput {
  ticketId: string;
  ticketNumber: string;
  comment: string;
}

export interface AddDiabeticQuestionnaireInput {
  patientId: string;
  plan?: string | null;
  diabetic_type?: string | null;
  diabetic_year?: string | null;
}

export interface AddHospitalizationRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  dischargeDate: any;
  hospitalName: string;
  doctorName: string;
  diagnosisNotes?: string | null;
  hospitalizationFiles?: (HospitalizationFileProperties | null)[] | null;
}

export interface AddImmunizationRecordInput {
  id?: string | null;
  registrationId?: string | null;
  dateOfImmunization?: any | null;
  patientId: string;
  recordType: MedicalRecordType;
  immunizationName: string;
  dateAdministered?: any | null;
  followUpDate?: any | null;
  doctorName?: string | null;
  manufacturer?: string | null;
  batchno?: string | null;
  vaccineName?: string | null;
  potency?: string | null;
  hospitalName?: string | null;
  vaccine_location?: string | null;
  notes?: string | null;
  source?: string | null;
  reactions?: (ImmunizationReactionsParameters | null)[] | null;
  immunizationFiles?: (ImmunizationFileProperties | null)[] | null;
}

export interface AddLabTestRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  labTestName: string;
  labTestDate: any;
  referringDoctor?: string | null;
  observations?: string | null;
  additionalNotes?: string | null;
  labTestResults?: (LabTestParameters | null)[] | null;
  testResultFiles?: (LabTestFileProperties | null)[] | null;
}

export interface AddMedicalConditionRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  medicalConditionName: string;
  doctorTreated: string;
  startDate: any;
  endDate?: any | null;
  notes?: string | null;
  illnessType: MedicalConditionIllnessTypes;
  medicationFiles?: (MedicalConditionFileProperties | null)[] | null;
}

export interface AddPatientHealthRestrictionRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  restrictionName: string;
  startDate: any;
  endDate?: any | null;
  suggestedByDoctor?: string | null;
  nature: HealthRestrictionNature;
  notes?: string | null;
}

export interface AddPatientMedicalBillRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  hospitalName?: string | null;
  bill_no?: string | null;
  billDate: any;
  notes?: string | null;
  billFiles?: (MedicalBillFileProperties | null)[] | null;
}

export interface AddPatientMedicalInsuranceRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  insuranceCompany: string;
  policyNumber?: string | null;
  startDate: any;
  endDate: any;
  sumInsured?: string | null;
  insuranceFiles?: (MedicalInsuranceFileProperties | null)[] | null;
  notes?: string | null;
}

export interface AddPatientMedicationRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  medicineName: string;
  medicalCondition?: string | null;
  doctorName?: string | null;
  startDate: any;
  endDate?: any | null;
  morning?: boolean | null;
  noon?: boolean | null;
  evening?: boolean | null;
  notes?: string | null;
}

export interface AddPrescriptionRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  prescriptionName?: string | null;
  additionalNotes?: string | null;
  issuingDoctor?: string | null;
  location?: string | null;
  dateOfPrescription?: any | null;
  prescriptionFiles?: (prescriptionPrismFileProperties | null)[] | null;
}

export interface AddressObj {
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressType?: string | null;
  zipcode?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  state?: string | null;
}

export interface AlertMedicineOrderPickupInput {
  orderId: number;
  patientId: string;
  remarks?: string | null;
}

export interface AllergyFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface AppointmentBookingRequestInput {
  patientId: string;
  doctorId: string;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  bookingSource?: BOOKINGSOURCE | null;
  deviceType?: DEVICETYPE | null;
  actualAmount?: number | null;
  discountedAmount?: number | null;
  requestDetail?: REQUEST_DETAIL | null;
}

export interface AppointmentHistoryInput {
  patientId: string;
  doctorId: string;
}

export interface AppointmentPaymentInputV2 {
  amountPaid: number;
  paymentStatus: string;
  paymentDateTime: any;
  responseCode?: string | null;
  responseMessage?: string | null;
  orderId: string;
}

export interface Attachments {
  documentName?: string | null;
  fileName?: string | null;
  documentBase64String?: string | null;
}

export interface BookAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  symptoms?: string | null;
  bookingSource?: BOOKINGSOURCE | null;
  deviceType?: DEVICETYPE | null;
  couponCode?: string | null;
  externalConnect?: boolean | null;
  pinCode?: string | null;
  actualAmount?: number | null;
  discountedAmount?: number | null;
  subscriptionDetails?: SUBSCRIPTION_DETAILS | null;
  planPurchaseDetails?: PLAN_PURCHASE_DETAILS | null;
}

export interface BookFollowUpAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string | null;
  followUpParentId: string;
}

export interface BookRescheduleAppointmentInput {
  appointmentId: string;
  doctorId: string;
  newDateTimeslot: any;
  initiatedBy: TRANSFER_INITIATED_TYPE;
  initiatedId: string;
  patientId: string;
  rescheduledId?: string | null;
  rescheduleReason?: string | null;
}

export interface BookTransferAppointmentInput {
  existingAppointmentId: string;
  doctorId: string;
  appointmentDateTime: any;
  patientId: string;
  transferId: string;
}

export interface CancelAppointmentInput {
  appointmentId: string;
  cancelReason?: string | null;
  cancelledBy: REQUEST_ROLES;
  cancelledById: string;
}

export interface CancellationDiagnosticsInput {
  comment?: string | null;
  orderId: string;
  patientId: string;
  reason: string;
}

export interface CheckCallConnectionInput {
  appointmentId: string;
  patientId: string;
}

export interface ChooseDoctorInput {
  slotDateTime: any;
  specialityId: string;
}

export interface ConsultQueueInput {
  appointmentId: string;
  height?: string | null;
  weight?: string | null;
  temperature?: string | null;
  bp?: string | null;
  lifeStyle?: string | null;
  familyHistory?: string | null;
  dietAllergies?: string | null;
  drugAllergies?: string | null;
  age?: number | null;
  gender?: Gender | null;
}

export interface CorporateEmailOtpInput {
  id: string;
  otp: string;
  loginType: LOGIN_TYPE;
}

export interface CouponInput {
  grossOrderAmountExcludingDiscount: number;
  testsOrdered?: (DiagnosticTestsOrdered | null)[] | null;
  cityId: number;
}

export interface CouponUsedDetails {
  discount_amount: number;
  bill_amount: number;
  coupon_code: string;
}

export interface CreateUserSubscriptionInput {
  _id?: string | null;
  plan_id?: string | null;
  group_plan_id?: string | null;
  payment_reference?: PaymentReference | null;
  coupon_availed?: string | null;
  mobile_number: string;
  order_id?: string | null;
  transaction_date_time?: any | null;
  status?: SubscriptionStatus | null;
  start_date?: any | null;
  end_date?: any | null;
  deactivation_date?: any | null;
  CustomerId?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  Email?: string | null;
  Gender?: Gender | null;
  DOB?: any | null;
  storeCode: one_apollo_store_code;
  sub_plan_id?: string | null;
  source_meta_data?: SourceMetaData | null;
  expires_in?: number | null;
  renewNow?: boolean | null;
}

export interface DeleteHealthRecordFilesInput {
  fileIndex?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  recordId?: string | null;
}

export interface DeleteMultipleHealthRecordFilesInput {
  fileIndexArray?: (number | null)[] | null;
  patientId: string;
  recordType: MedicalRecordType;
  recordId?: string | null;
}

export interface DeletePatientPrismMedicalRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
}

export interface DiagnosticInitiateOrderPayment {
  orderId?: string | null;
}

export interface DiagnosticLineItem {
  itemId?: number | null;
  price?: number | null;
  quantity?: number | null;
  groupPlan?: string | null;
  preTestingRequirement?: string | null;
  reportGenerationTime?: string | null;
}

export interface DiagnosticOrderInput {
  patientId: string;
  patientAddressId: string;
  city: string;
  cityId: string;
  state: string;
  stateId: string;
  slotTimings: string;
  employeeSlotId?: any | null;
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
  slotId?: string | null;
  areaId?: number | null;
  totalPriceExcludingDiscounts?: number | null;
  userSubscriptionId?: string | null;
  subscriptionInclusionId?: string | null;
}

export interface DiagnosticTestsOrdered {
  itemId?: number | null;
  itemName?: string | null;
  rateExcludingDiscount?: number | null;
  groupPlan?: string | null;
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

export interface DoctorPhysicalAvailabilityInput {
  availableDate: any;
  doctorId: string;
  facilityId: string;
  getOnlyMedmantraSlot?: boolean | null;
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

export interface EndAppointmentSessionInput {
  appointmentId: string;
  status: STATUS;
  noShowBy?: REQUEST_ROLES | null;
  deviceType?: DEVICETYPE | null;
  callSource?: BOOKINGSOURCE | null;
  callType?: APPT_CALL_TYPE | null;
  appVersion?: string | null;
  isReferred?: boolean | null;
}

export interface FamilyHistoryFilesProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface FamilyHistoryParameters {
  patientId: string;
  diseaseName?: string | null;
  id?: string | null;
  familyMember?: Relation | null;
  notes?: string | null;
  age?: number | null;
  recordDate?: any | null;
  attachmentList?: (FamilyHistoryFilesProperties | null)[] | null;
}

export interface FilterDoctorInput {
  patientId?: string | null;
  specialty?: string | null;
  specialtySearchType?: SpecialtySearchType | null;
  specialtyName?: (string | null)[] | null;
  city?: (string | null)[] | null;
  experience?: (Range | null)[] | null;
  availability?: (string | null)[] | null;
  availableNow?: string | null;
  fees?: (Range | null)[] | null;
  gender?: (Gender | null)[] | null;
  language?: (string | null)[] | null;
  geolocation?: Geolocation | null;
  consultMode?: ConsultMode | null;
  pincode?: string | null;
  doctorType?: (string | null)[] | null;
  sort?: string | null;
  pageNo?: number | null;
  pageSize?: number | null;
  searchText?: string | null;
  radius?: number | null;
  isCare?: boolean | null;
  isSearchableOnHiddenDoctor?: boolean | null;
}

export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface HelpEmailInput {
  category?: string | null;
  reason?: string | null;
  comments?: string | null;
  patientId?: string | null;
  email?: string | null;
  orderId?: number | null;
  orderType?: ORDER_REQUEST_TYPE | null;
}

export interface HospitalizationFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface ImmunizationFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface ImmunizationReactionsParameters {
  type?: string | null;
  from?: any | null;
  to?: any | null;
}

export interface LabTestFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface LabTestParameters {
  maximum?: number | null;
  minimum?: number | null;
  parameterName?: string | null;
  result?: number | null;
  unit?: string | null;
}

export interface MediaPrescriptionFileProperties {
  fileName: string;
  mimeType: string;
  content: string;
}

export interface MediaPrescriptionUploadRequest {
  prescribedBy: string;
  dateOfPrescription: any;
  startDate?: any | null;
  endDate?: any | null;
  notes?: string | null;
  prescriptionSource: mediaPrescriptionSource;
  prescriptionFiles?: (MediaPrescriptionFileProperties | null)[] | null;
}

export interface MedicalBillFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface MedicalConditionFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface MedicalInsuranceFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface MedicineCartOMSInput {
  quoteId?: string | null;
  shopId?: string | null;
  tatType?: string | null;
  estimatedAmount?: number | null;
  patientId: string;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  bookingSource?: BOOKING_SOURCE | null;
  deviceType?: DEVICE_TYPE | null;
  appVersion?: string | null;
  patientAddressId?: string | null;
  devliveryCharges?: number | null;
  prescriptionImageUrl?: string | null;
  prismPrescriptionFileId?: string | null;
  orderTat?: string | null;
  items?: (MedicineCartOMSItem | null)[] | null;
  coupon?: string | null;
  couponDiscount?: number | null;
  productDiscount?: number | null;
  packagingCharges?: number | null;
  showPrescriptionAtStore?: boolean | null;
  shopAddress?: ShopAddress | null;
  customerComment?: string | null;
  storeDistanceKm?: number | null;
  subscriptionDetails?: SUBSCRIPTION_DETAILS_PHARMA | null;
  planPurchaseDetails?: PLAN_PURCHASE_DETAILS_PHARMA | null;
  healthCreditUsed?: number | null;
  totalCashBack?: number | null;
  savedDeliveryCharge?: number | null;
  prescriptionType?: PrescriptionType | null;
  tatCity?: string | null;
  tatHours?: string | null;
}

export interface MedicineCartOMSItem {
  medicineSKU?: string | null;
  medicineName?: string | null;
  couponFree?: number | null;
  price?: number | null;
  quantity?: number | null;
  mrp?: number | null;
  itemValue?: number | null;
  itemDiscount?: number | null;
  isPrescriptionNeeded?: number | null;
  mou?: number | null;
  isMedicine: string;
  specialPrice: number;
  subCategory?: string | null;
}

export interface MedicineOrderCancelOMSInput {
  orderNo?: number | null;
  cancelReasonCode?: string | null;
  cancelReasonText?: string | null;
}

export interface MedicineOrderShipmentInput {
  shopId?: string | null;
  tatType?: string | null;
  estimatedAmount?: number | null;
  deliveryCharges?: number | null;
  orderTat?: string | null;
  coupon?: string | null;
  couponDiscount?: number | null;
  productDiscount?: number | null;
  packagingCharges?: number | null;
  showPrescriptionAtStore?: boolean | null;
  shopAddress?: ShopAddress | null;
  savedDeliveryCharge?: number | null;
  totalCashBack?: number | null;
  storeDistanceKm?: number | null;
  items?: (MedicineCartOMSItem | null)[] | null;
  tatCity?: string | null;
  tatHours?: string | null;
  allocationProfileName?: string | null;
  clusterId?: string | null;
}

export interface MedicinePaymentMqInput {
  mid?: string | null;
  orderAutoId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId?: string | null;
  refundAmount?: number | null;
  bankName?: string | null;
  paymentStatus?: string | null;
  paymentDateTime?: any | null;
  responseCode?: string | null;
  responseMessage?: string | null;
  bankTxnId?: string | null;
  email?: string | null;
  CODCity?: CODCity | null;
  orderId?: string | null;
  paymentMode?: PAYMENT_METHODS | null;
  healthCredits?: number | null;
  partnerInfo?: string | null;
  planId?: string | null;
  storeCode?: ONE_APOLLO_STORE_CODE | null;
  subPlanId?: string | null;
  payload?: string | null;
  healthCreditsSub?: number | null;
}

export interface MedicinePaymentMqV2Input {
  mid?: string | null;
  transactionId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId?: string | null;
  refundAmount?: number | null;
  bankName?: string | null;
  paymentStatus?: string | null;
  paymentDateTime?: any | null;
  responseCode?: string | null;
  responseMessage?: string | null;
  bankTxnId?: string | null;
  email?: string | null;
  CODCity?: CODCity | null;
  orderId?: string | null;
  paymentMode?: PAYMENT_METHODS | null;
  healthCredits?: number | null;
  partnerInfo?: string | null;
  planId?: string | null;
  storeCode?: ONE_APOLLO_STORE_CODE | null;
  subPlanId?: string | null;
  payload?: string | null;
  healthCreditsSub?: number | null;
}

export interface MessageInput {
  fromId: string;
  toId: string;
  eventName: notificationEventName;
  eventId: string;
  message: string;
  status: notificationStatus;
  type: notificationType;
  source?: TRANSFER_INITIATED_TYPE | null;
}

export interface OrderCreate {
  orders: OrderVerticals;
  total_amount: number;
  patient_id?: any | null;
  customer_id?: any | null;
}

export interface OrderInputEntity {
  order_id: string;
  amount: number;
  patient_id?: any | null;
}

export interface OrderInputV2 {
  payment_order_id: string;
  health_credits_used?: number | null;
  cash_to_collect?: number | null;
  prepaid_amount?: number | null;
  store_code?: ONEAPOLLO_STORECODE | null;
  is_mobile_sdk?: boolean | null;
  return_url?: string | null;
  gateway_id?: number | null;
}

export interface OrderLineItems {
  itemId: string;
  mrp: number;
  productName: string;
  productType: CouponCategoryApplicable;
  quantity: number;
  specialPrice: number;
  couponFree?: number | null;
}

export interface OrderVerticals {
  pharma?: (OrderInputEntity | null)[] | null;
  consult?: (OrderInputEntity | null)[] | null;
  diagnostics?: (OrderInputEntity | null)[] | null;
  subscription?: (OrderInputEntity | null)[] | null;
  vaccination?: (OrderInputEntity | null)[] | null;
}

export interface OtpVerificationInput {
  id: string;
  otp: string;
  loginType: LOGIN_TYPE;
}

export interface PLAN_PURCHASE_DETAILS {
  TYPE?: PLAN | null;
  PlanAmount?: number | null;
}

export interface PLAN_PURCHASE_DETAILS_PHARMA {
  TYPE?: PLAN | null;
  PlanAmount?: number | null;
  planId?: string | null;
  subPlanId?: string | null;
}

export interface PatientAddressInput {
  patientId: string;
  name?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode: string;
  mobileNumber?: string | null;
  landmark?: string | null;
  addressType?: PATIENT_ADDRESS_TYPE | null;
  otherAddressType?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  stateCode?: string | null;
  defaultAddress?: boolean | null;
}

export interface PatientAppointmentsInput {
  patientId: string;
  appointmentDate: any;
}

export interface PatientConsultsAndOrdersByMobileInput {
  mobileNumber: string;
  filter?: CONSULTS_RX_SEARCH_FILTER[] | null;
  offset?: number | null;
  limit?: number | null;
}

export interface PatientConsultsAndOrdersInput {
  patient: string;
  filter?: CONSULTS_RX_SEARCH_FILTER[] | null;
  offset?: number | null;
  limit?: number | null;
}

export interface PatientFeedbackInput {
  patientId: string;
  rating?: string | null;
  thankyouNote?: string | null;
  reason?: string | null;
  feedbackType?: FEEDBACKTYPE | null;
  transactionId: string;
}

export interface PatientLocation {
  city?: string | null;
  pincode?: number | null;
}

export interface PatientMedicalParameters {
  patientId: string;
  height?: string | null;
  weight?: string | null;
  bloodGroup?: BloodGroups | null;
}

export interface PatientProfileInput {
  firstName: string;
  lastName: string;
  dateOfBirth: any;
  gender: Gender;
  relation: Relation;
  emailAddress: string;
  photoUrl?: string | null;
  mobileNumber: string;
  partnerId?: string | null;
  id?: string | null;
}

export interface PaymentReference {
  mid?: string | null;
  amount_paid?: number | null;
  payment_status?: PaymentStatus | null;
  payment_reference_id?: string | null;
  purchase_via_HC?: boolean | null;
  HC_used?: number | null;
  ORDERID?: string | null;
  TXNAMOUNT?: string | null;
  PAYMENTMODE?: string | null;
  CURRENCY?: string | null;
  TXNDATE?: any | null;
  RESPCODE?: string | null;
  RESPMSG?: string | null;
  MERC_UNQ_REF?: string | null;
  GATEWAYNAME?: string | null;
  BANKTXNID?: string | null;
  BANKNAME?: string | null;
  backend_activation?: boolean | null;
  done_by?: string | null;
  sub_plan_id?: string | null;
  coupon_used_details?: CouponUsedDetails | null;
  cash_to_collect?: number | null;
  oneapollo_request_number?: string | null;
}

export interface PharmaCouponInput {
  code: string;
  patientId: string;
  orderLineItems?: (OrderLineItems | null)[] | null;
}

export interface PrescriptionMedicineOrderOMSInput {
  quoteId?: string | null;
  shopId?: string | null;
  patientId: string;
  bookingSource?: BOOKING_SOURCE | null;
  deviceType?: DEVICE_TYPE | null;
  appVersion?: string | null;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patinetAddressId?: string | null;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  appointmentId?: string | null;
  isEprescription?: number | null;
  payment?: PrescriptionMedicinePaymentOMSDetails | null;
  email?: string | null;
  NonCartOrderCity?: NonCartOrderOMSCity | null;
  orderAutoId?: number | null;
  shopAddress?: ShopAddress | null;
  prescriptionOptionSelected?: string | null;
  durationDays?: number | null;
  customerComment?: string | null;
}

export interface PrescriptionMedicinePaymentOMSDetails {
  paymentType?: MEDICINE_ORDER_PAYMENT_TYPE | null;
  amountPaid?: number | null;
  paymentRefId?: string | null;
  paymentStatus?: string | null;
  paymentDateTime?: any | null;
}

export interface PrescriptionReUploadInput {
  orderId: number;
  fileUrl: string;
  prismPrescriptionFileId?: string | null;
}

export interface PreviousOrdersSkus {
  patientId: string;
  fromDate?: number | null;
  toDate?: number | null;
}

export interface ProcessDiagnosticHCOrderInput {
  orderID: string;
  statusDate?: any | null;
  paymentMode?: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  amount: number;
}

export interface REQUEST_DETAIL {
  preferredDateText?: string | null;
}

export interface Range {
  minimum?: number | null;
  maximum?: number | null;
}

export interface RescheduleDiagnosticsInput {
  comment?: string | null;
  date: any;
  dateTimeInUTC: any;
  orderId: string;
  patientId: string;
  reason?: string | null;
  slotId: string;
  source?: DiagnosticsRescheduleSource | null;
}

export interface ReturnPharmaOrderInput {
  category?: string | null;
  reason?: string | null;
  subReason?: string | null;
  comments?: string | null;
  patientId?: string | null;
  email: string;
  orderId?: number | null;
  orderType?: ORDER_TYPE | null;
  orderFiles?: fileProperties[] | null;
}

export interface SUBSCRIPTION_DETAILS {
  userSubscriptionId?: string | null;
  plan?: PLAN | null;
  planId?: string | null;
  groupPlanId?: string | null;
}

export interface SUBSCRIPTION_DETAILS_PHARMA {
  userSubscriptionId?: string | null;
}

export interface SaveBookHomeCollectionOrderInput {
  patientId: string;
  patientAddressId: string;
  totalPrice: number;
  prescriptionUrl: string;
  diagnosticDate: any;
  bookingSource?: DiagnosticsBookingSource | null;
  deviceType?: DEVICETYPE | null;
  items?: (DiagnosticLineItem | null)[] | null;
  slotId: string;
  areaId: number;
  collectionCharges: number;
  uniqueID?: string | null;
  slotDateTimeInUTC: any;
  totalPriceExcludingDiscounts?: number | null;
  userSubscriptionId?: string | null;
  subscriptionInclusionId?: string | null;
  attachmentData?: (Attachments | null)[] | null;
  caseSheets?: (string | null)[] | null;
}

export interface SaveDeviceTokenInput {
  deviceType: DEVICE_TYPE;
  deviceToken: string;
  deviceOS: string;
  patientId: string;
}

export interface SaveMedicineOrderV2Input {
  patientId: string;
  estimatedAmount?: number | null;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  bookingSource?: BOOKING_SOURCE | null;
  deviceType?: DEVICE_TYPE | null;
  appVersion?: string | null;
  coupon?: string | null;
  patientAddressId?: string | null;
  prescriptionImageUrl?: string | null;
  prismPrescriptionFileId?: string | null;
  customerComment?: string | null;
  subscriptionDetails?: SUBSCRIPTION_DETAILS_PHARMA | null;
  planPurchaseDetails?: PLAN_PURCHASE_DETAILS_PHARMA | null;
  healthCreditUsed?: number | null;
  shipments?: (MedicineOrderShipmentInput | null)[] | null;
  prescriptionType?: PrescriptionType | null;
}

export interface SavePatientNotificationSettingsInput {
  patient: string;
  commissionNotification?: boolean | null;
  messageFromDoctorNotification?: boolean | null;
  playNotificationSound?: boolean | null;
  reScheduleAndCancellationNotification?: boolean | null;
  paymentNotification?: boolean | null;
  upcomingAppointmentReminders?: boolean | null;
}

export interface SaveSearchInput {
  type?: SEARCH_TYPE | null;
  typeId: string;
  typeName?: string | null;
  image?: string | null;
  patient: string;
}

export interface ShopAddress {
  storename?: string | null;
  address?: string | null;
  workinghrs?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  stateCode?: string | null;
}

export interface SourceMetaData {
  source_identifier?: string | null;
  sub_plan_id?: string | null;
  purchase_type?: PlanPurchaseType | null;
  activity?: any | null;
}

export interface TrueCallerProfile {
  avatarUrl?: string | null;
  city?: string | null;
  companyName?: string | null;
  countryCode?: string | null;
  email?: string | null;
  facebookId?: string | null;
  firstName?: string | null;
  gender?: string | null;
  isAmbassador?: boolean | null;
  isSimChanged?: boolean | null;
  isTrueName?: boolean | null;
  jobTitle?: string | null;
  lastName?: string | null;
  payload?: string | null;
  phoneNumber?: string | null;
  requestNonce?: string | null;
  signature?: string | null;
  signatureAlgorithm?: string | null;
  street?: string | null;
  twitterId?: string | null;
  url?: string | null;
  verificationMode?: string | null;
  zipcode?: string | null;
}

export interface UpdateAppointmentInput {
  appointmentId: string;
  patientLocation?: PatientLocation | null;
  paymentOrderId?: string | null;
  status?: STATUS | null;
  discountedAmount?: number | null;
}

export interface UpdateAppointmentSessionInput {
  appointmentId: string;
  requestRole: string;
  isUserJoining?: boolean | null;
}

export interface UpdateHelpdeskTicketInput {
  ticketId: string;
  status: HELP_DESK_TICKET_STATUS;
}

export interface UpdatePatientAddressInput {
  id: string;
  name?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode: string;
  mobileNumber?: string | null;
  landmark?: string | null;
  addressType?: PATIENT_ADDRESS_TYPE | null;
  otherAddressType?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  stateCode?: string | null;
  defaultAddress?: boolean | null;
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
  externalAuthId?: string | null;
  employeeId?: string | null;
  partnerId?: string | null;
  appsflyerId?: string | null;
  isConsulted?: boolean | null;
}

export interface UploadDocumentInput {
  fileType: UPLOAD_FILE_TYPES;
  base64FileInput: string;
  patientId: string;
  category: PRISM_DOCUMENT_CATEGORY;
}

export interface VerifyVPA {
  vpa: string;
  merchant_id?: string | null;
}

export interface fileProperties {
  fileType?: string | null;
  base64FileInput?: string | null;
}

export interface prescriptionPrismFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface saveModifyDiagnosticOrderInput {
  orderId?: string | null;
  amountToPay?: number | null;
  collectionCharges?: number | null;
  bookingSource?: DiagnosticsBookingSource | null;
  deviceType?: DEVICETYPE | null;
  items?: (DiagnosticLineItem | null)[] | null;
  userSubscriptionId?: string | null;
  subscriptionInclusionId?: string | null;
}

export interface voipPushTokenInput {
  patientId?: string | null;
  voipToken?: string | null;
}
/** * current status of appointment */
export enum APPOINTMENT_STATUS {
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED',
  REJECTED = "REJECTED"
}
/** * dose number first second */
export enum DOSE_NUMBER {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
}
/** * payment type for appointment */
export enum PAYMENT_TYPE {
  CASHLESS = 'CASHLESS',
  COD = 'COD',
  PREPAID = 'PREPAID',
  IN_APP_PURCHASE = "IN_APP_PURCHASE"
}
/** * booking source */
export enum VACCINE_BOOKING_SOURCE {
  AP_IN = 'AP_IN',
  MOBILE = 'MOBILE',
  WEB = 'WEB',
}
/** * types of vaccine */
export enum VACCINE_TYPE {
  COVAXIN = 'COVAXIN',
  COVISHIELD = 'COVISHIELD',
  SPUTNIK = 'SPUTNIK',
  MORDERNA = 'MORDERNA',
}
export interface CreateAppointmentInput {
  appointment_id?: string | null;
  patient_id: string;
  resource_session_id: string;
  dose_number: DOSE_NUMBER;
  booking_source?: VACCINE_BOOKING_SOURCE | null;
  corporate_name?: string | null;
}

/** * COWIN_GENDER */
export enum COWIN_GENDER { 
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHERS = "OTHERS",
}

export enum COWIN_GOVT_PHOTO_ID { 
  AADHAAR_CARD = "AADHAAR_CARD",
  DRIVING_LICENSE = "DRIVING_LICENSE", 
  NPR_SMART_CARD = "NPR_SMART_CARD", 
  PAN_CARD = "PAN_CARD", 
  PASSPORT = "PASSPORT", 
  PENSION_PASSBOOK = "PENSION_PASSBOOK", 
  UNIQUE_DISABILITY_ID = "UNIQUE_DISABILITY_ID", 
  VOTER_ID = "VOTER_ID",
}

export interface CowinRegistrationInput { 
  operationType: OperationType; 
  name: string; 
  gender_id: COWIN_GENDER; 
  birth_year: string;
  photo_id_type: COWIN_GOVT_PHOTO_ID; 
  photo_id_number: string;
  otp?: string | null; 
  txnId?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
