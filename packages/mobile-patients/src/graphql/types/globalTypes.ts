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

export enum AppointmentType {
  BOTH = "BOTH",
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum BOOKINGSOURCE {
  MOBILE = "MOBILE",
  WEB = "WEB",
}

export enum BOOKING_SOURCE {
  MFINE = "MFINE",
  MOBILE = "MOBILE",
  ORDER_PUNCHING_TOOL = "ORDER_PUNCHING_TOOL",
  WEB = "WEB",
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
  SAMPLE_COLLECTED = "SAMPLE_COLLECTED",
  SAMPLE_RECEIVED_IN_LAB = "SAMPLE_RECEIVED_IN_LAB",
  SAMPLE_RECIEVED_IN_LAB = "SAMPLE_RECIEVED_IN_LAB",
  REPORT_GENERATED = "REPORT_GENERATED",
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

export enum LOGIN_TYPE {
  DOCTOR = "DOCTOR",
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
  DELIVERED = "DELIVERED",
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

export enum MedicalRecordType {
  CONSULTATION = "CONSULTATION",
  EHR = "EHR",
  HEALTHCHECK = "HEALTHCHECK",
  HOSPITALIZATION = "HOSPITALIZATION",
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

export enum NonCartOrderOMSCity {
  CHENNAI = "CHENNAI",
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

export enum PRISM_DOCUMENT_CATEGORY {
  HealthChecks = "HealthChecks",
  OpSummary = "OpSummary",
  TestReports = "TestReports",
}

export enum PharmaDiscountApplicableOn {
  MRP = "MRP",
  SPECIAL_PRICE = "SPECIAL_PRICE",
}

export enum REFUND_STATUS {
  REFUND_FAILED = "REFUND_FAILED",
  REFUND_REQUEST_NOT_RAISED = "REFUND_REQUEST_NOT_RAISED",
  REFUND_REQUEST_RAISED = "REFUND_REQUEST_RAISED",
  REFUND_SUCCESSFUL = "REFUND_SUCCESSFUL",
}

export enum REQUEST_ROLES {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  JUNIOR = "JUNIOR",
  PATIENT = "PATIENT",
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
  DEFERRED_INACTIVE = "DEFERRED_INACTIVE",
  DISABLED = "DISABLED",
  UPGRADED = "UPGRADED",
}

export enum TEST_COLLECTION_TYPE {
  CENTER = "CENTER",
  HC = "HC",
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

export enum WeekDay {
  FRIDAY = "FRIDAY",
  MONDAY = "MONDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
  THURSDAY = "THURSDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
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

export interface AddHealthCheckRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  healthCheckName: string;
  healthCheckDate: any;
  healthCheckFiles?: (HealthCheckFileProperties | null)[] | null;
}

export interface AddHospitalizationRecordInput {
  id?: string | null;
  patientId: string;
  recordType: MedicalRecordType;
  dischargeDate: any;
  hospitalName: string;
  doctorName: string;
  hospitalizationFiles?: (HospitalizationFileProperties | null)[] | null;
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
  testResultFiles?: LabResultFileProperties | null;
}

export interface AddMedicalRecordParametersInput {
  maximum?: number | null;
  minimum?: number | null;
  parameterName?: string | null;
  result?: number | null;
  unit?: MedicalTestUnit | null;
}

export interface AlertMedicineOrderPickupInput {
  orderId: number;
  patientId: string;
  remarks?: string | null;
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
  bankName?: string | null;
  refundAmount?: number | null;
  paymentMode?: PAYMENT_METHODS | null;
  partnerInfo?: string | null;
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

export interface CreateUserSubscriptionInput {
  _id?: string | null;
  plan_id: string;
  payment_reference_id?: string | null;
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
  Gender?: string | null;
  DOB?: any | null;
  storeCode: string;
}

export interface DiagnosticBookHomeCollectionInput {
  patientId: string;
  patientAddressId: string;
  slotTimings: string;
  totalPrice: number;
  prescriptionUrl: string;
  diagnosticDate: any;
  bookingSource?: BOOKINGSOURCE | null;
  deviceType?: DEVICETYPE | null;
  paymentType?: DIAGNOSTIC_ORDER_PAYMENT_TYPE | null;
  items?: (DiagnosticLineItem | null)[] | null;
  slotId: string;
  areaId: number;
  homeCollectionCharges: number;
}

export interface DiagnosticLineItem {
  itemId?: number | null;
  price?: number | null;
  quantity?: number | null;
  groupPlan?: string | null;
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
}

export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface HealthCheckFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface HelpEmailInput {
  category?: string | null;
  reason?: string | null;
  comments?: string | null;
  patientId?: string | null;
  email?: string | null;
}

export interface HospitalizationFileProperties {
  fileName?: string | null;
  mimeType?: string | null;
  content?: string | null;
}

export interface LabResultFileProperties {
  fileName: string;
  mimeType: string;
  content: string;
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

export interface MedicineCartOMSInput {
  quoteId?: string | null;
  shopId?: string | null;
  tatType?: string | null;
  estimatedAmount?: number | null;
  patientId: string;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  bookingSource?: BOOKINGSOURCE | null;
  deviceType?: DEVICETYPE | null;
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
}

export interface MedicineOrderCancelOMSInput {
  orderNo?: number | null;
  cancelReasonCode?: string | null;
  cancelReasonText?: string | null;
}

export interface MedicinePaymentMqInput {
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
  payload?: string | null;
}

export interface MessageInput {
  fromId: string;
  toId: string;
  eventName: notificationEventName;
  eventId: string;
  message: string;
  status: notificationStatus;
  type: notificationType;
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

export interface OtpVerificationInput {
  id: string;
  otp: string;
  loginType: LOGIN_TYPE;
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

export interface Range {
  minimum?: number | null;
  maximum?: number | null;
}

export interface SaveDeviceTokenInput {
  deviceType: DEVICE_TYPE;
  deviceToken: string;
  deviceOS: string;
  patientId: string;
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

export interface UpdateAppointmentSessionInput {
  appointmentId: string;
  requestRole: string;
}

export interface UpdateDiagnosticOrderInput {
  id?: string | null;
  slotTimings: string;
  employeeSlotId: number;
  diagnosticEmployeeCode: string;
  diagnosticBranchCode: string;
  prescriptionUrl: string;
  diagnosticDate: any;
  centerName: string;
  centerCode: string;
  centerCity: string;
  centerState: string;
  centerLocality: string;
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
  employeeId?: string | null;
  partnerId?: string | null;
}

export interface UploadDocumentInput {
  fileType: UPLOAD_FILE_TYPES;
  base64FileInput: string;
  patientId: string;
  category: PRISM_DOCUMENT_CATEGORY;
}

export interface voipPushTokenInput {
  patientId?: string | null;
  voipToken?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
