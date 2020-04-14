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

export enum AccountType {
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS",
}

export enum AppointmentType {
  BOTH = "BOTH",
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum BOOKINGSOURCE {
  MOBILE = "MOBILE",
  WEB = "WEB",
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

export enum DEVICETYPE {
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

export enum DOCTOR_ONLINE_STATUS {
  AWAY = "AWAY",
  ONLINE = "ONLINE",
}

export enum DiscountType {
  FLATPRICE = "FLATPRICE",
  PERCENT = "PERCENT",
  PRICEOFF = "PRICEOFF",
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

export enum MEDICINE_DELIVERY_TYPE {
  HOME_DELIVERY = "HOME_DELIVERY",
  STORE_PICKUP = "STORE_PICKUP",
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
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_FAILED = "ORDER_FAILED",
  ORDER_INITIATED = "ORDER_INITIATED",
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_VERIFIED = "ORDER_VERIFIED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  PAYMENT_FAILED = "PAYMENT_FAILED",
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

export enum PATIENT_ADDRESS_TYPE {
  HOME = "HOME",
  OFFICE = "OFFICE",
  OTHER = "OTHER",
}

export enum PRISM_DOCUMENT_CATEGORY {
  HealthChecks = "HealthChecks",
  OpSummary = "OpSummary",
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
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PENDING = "PENDING",
  UNAVAILABLE_MEDMANTRA = "UNAVAILABLE_MEDMANTRA",
}

export enum Salutation {
  DR = "DR",
  MR = "MR",
  MRS = "MRS",
}

export enum SpecialtySearchType {
  ID = "ID",
  NAME = "NAME",
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

export enum WeekDay {
  FRIDAY = "FRIDAY",
  MONDAY = "MONDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
  THURSDAY = "THURSDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
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

export interface AppointmentHistoryInput {
  patientId: string;
  doctorId: string;
}

export interface AppointmentPaymentInput {
  amountPaid: number;
  paymentRefId?: string | null;
  paymentStatus: string;
  paymentDateTime: any;
  responseCode: string;
  responseMessage: string;
  bankTxnId?: string | null;
  orderId?: string | null;
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
  paymentType?: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  items?: (DiagnosticLineItem | null)[] | null;
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
}

export interface MedicineCartInput {
  quoteId?: string | null;
  shopId?: string | null;
  estimatedAmount?: number | null;
  patientId: string;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patientAddressId: string;
  devliveryCharges?: number | null;
  prescriptionImageUrl?: string | null;
  prismPrescriptionFileId?: string | null;
  orderTat?: string | null;
  items?: (MedicineCartItem | null)[] | null;
}

export interface MedicineCartItem {
  medicineSKU?: string | null;
  medicineName?: string | null;
  price?: number | null;
  quantity?: number | null;
  mrp?: number | null;
  isPrescriptionNeeded?: number | null;
  prescriptionImageUrl?: string | null;
  prismPrescriptionFileId?: string | null;
  mou?: number | null;
  isMedicine?: string | null;
}

export interface MedicinePaymentInput {
  orderId: string;
  orderAutoId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId?: string | null;
  paymentStatus?: string | null;
  paymentDateTime?: any | null;
  responseCode?: string | null;
  responseMessage?: string | null;
  bankTxnId?: string | null;
}

export interface MedicinePaymentMqInput {
  orderId: string;
  orderAutoId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId?: string | null;
  paymentStatus?: string | null;
  paymentDateTime?: any | null;
  responseCode?: string | null;
  responseMessage?: string | null;
  bankTxnId?: string | null;
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

export interface PatientAddressInput {
  patientId: string;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode: string;
  mobileNumber?: string | null;
  landmark?: string | null;
  addressType?: PATIENT_ADDRESS_TYPE | null;
  otherAddressType?: string | null;
}

export interface PatientAppointmentsInput {
  patientId: string;
  appointmentDate: any;
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
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patinetAddressId?: string | null;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  appointmentId?: string | null;
  isEprescription?: number | null;
  payment?: PrescriptionMedicinePaymentDetails | null;
}

export interface PrescriptionMedicinePaymentDetails {
  paymentType?: MEDICINE_ORDER_PAYMENT_TYPE | null;
  amountPaid?: number | null;
  paymentRefId?: string | null;
  paymentStatus?: string | null;
  paymentDateTime?: any | null;
}

export interface Range {
  minimum?: number | null;
  maximum?: number | null;
}

export interface SaveSearchInput {
  type?: SEARCH_TYPE | null;
  typeId: string;
  typeName?: string | null;
  patient: string;
}

export interface UpdateAppointmentSessionInput {
  appointmentId: string;
  requestRole: string;
}

export interface UpdatePatientAddressInput {
  id: string;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode: string;
  mobileNumber?: string | null;
  landmark?: string | null;
  addressType?: PATIENT_ADDRESS_TYPE | null;
  otherAddressType?: string | null;
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
