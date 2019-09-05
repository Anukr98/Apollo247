/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum APPOINTMENT_STATE {
  NEW = 'NEW',
  RESCHEDULE = 'RESCHEDULE',
  TRANSFER = 'TRANSFER',
}

export enum APPOINTMENT_TYPE {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
}

export enum ConsultMode {
  BOTH = 'BOTH',
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
}

export enum DEVICE_TYPE {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

export enum DoctorType {
  APOLLO = 'APOLLO',
  JUNIOR = 'JUNIOR',
  PAYROLL = 'PAYROLL',
  STAR_APOLLO = 'STAR_APOLLO',
}

export enum Gender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  OTHER = 'OTHER',
}

export enum MEDICINE_DELIVERY_TYPE {
  HOME_DELIVERY = 'HOME_DELIVERY',
  STORE_PICKUP = 'STORE_PICKUP',
}

export enum MEDICINE_ORDER_PAYMENT_TYPE {
  CASHLESS = 'CASHLESS',
  COD = 'COD',
  NO_PAYMENT = 'NO_PAYMENT',
}

export enum MEDICINE_ORDER_STATUS {
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
  ITEMS_RETURNED = 'ITEMS_RETURNED',
  ORDER_FAILED = 'ORDER_FAILED',
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_VERIFIED = 'ORDER_VERIFIED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  PICKEDUP = 'PICKEDUP',
  PRESCRIPTION_UPLOADED = 'PRESCRIPTION_UPLOADED',
  QUOTE = 'QUOTE',
  RETURN_ACCEPTED = 'RETURN_ACCEPTED',
  RETURN_INITIATED = 'RETURN_INITIATED',
}

export enum MEDICINE_ORDER_TYPE {
  CART_ORDER = 'CART_ORDER',
  UPLOAD_PRESCRIPTION = 'UPLOAD_PRESCRIPTION',
}

export enum MEDICINE_TIMINGS {
  EVENING = 'EVENING',
  MORNING = 'MORNING',
  NIGHT = 'NIGHT',
  NOON = 'NOON',
}

export enum MEDICINE_TO_BE_TAKEN {
  AFTER_FOOD = 'AFTER_FOOD',
  BEFORE_FOOD = 'BEFORE_FOOD',
}

export enum Relation {
  BROTHER = 'BROTHER',
  COUSIN = 'COUSIN',
  FATHER = 'FATHER',
  HUSBAND = 'HUSBAND',
  ME = 'ME',
  MOTHER = 'MOTHER',
  OTHER = 'OTHER',
  SISTER = 'SISTER',
  WIFE = 'WIFE',
}

export enum SEARCH_TYPE {
  DOCTOR = 'DOCTOR',
  MEDICINE = 'MEDICINE',
  SPECIALTY = 'SPECIALTY',
}

export enum STATUS {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  NO_SHOW = 'NO_SHOW',
  PENDING = 'PENDING',
}

export enum Salutation {
  DR = 'DR',
  MR = 'MR',
  MRS = 'MRS',
}

export enum WeekDay {
  FRIDAY = 'FRIDAY',
  MONDAY = 'MONDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
  THURSDAY = 'THURSDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
}

export interface AddMedicalRecordInput {
  patientId: string;
  testName: string;
  testDate?: any | null;
  recordType?: string | null;
  referringDoctor?: string | null;
  sourceName?: string | null;
  observations?: string | null;
  additionalNotes?: string | null;
  documentURLs?: string | null;
  medicalRecordParameters?: (AddMedicalRecordParametersInput | null)[] | null;
}

export interface AddMedicalRecordParametersInput {
  parameterName: string;
  unit?: string | null;
  result: number;
  minimum?: number | null;
  maximum?: number | null;
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

export interface DoctorPhysicalAvailabilityInput {
  availableDate: any;
  doctorId: string;
  facilityId: string;
}

export interface FilterDoctorInput {
  patientId?: string | null;
  specialty: string;
  city?: (string | null)[] | null;
  experience?: (Range | null)[] | null;
  availability?: (string | null)[] | null;
  availableNow?: string | null;
  fees?: (Range | null)[] | null;
  gender?: (Gender | null)[] | null;
  language?: (string | null)[] | null;
  location?: string | null;
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

export interface PatientAddressInput {
  patientId: string;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode: string;
  mobileNumber?: string | null;
  landmark?: string | null;
}

export interface PatientAppointmentsInput {
  patientId: string;
  appointmentDate: any;
}

export interface PatientConsultsAndOrdersInput {
  patient: string;
  offset?: number | null;
  limit?: number | null;
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
  patient: string;
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

//==============================================================
// END Enums and Input Objects
//==============================================================
