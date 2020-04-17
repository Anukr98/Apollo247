import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { Validate, IsOptional } from 'class-validator';
import { NameValidator, MobileNumberValidator } from 'validators/entityValidators';
import { ConsultMode } from 'doctors-service/entities';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum REGISTRATION_CODES_STATUS {
  SENT = 'SENT',
  NOT_SENT = 'NOT_SENT',
}

export enum PATIENT_ADDRESS_TYPE {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
}

export enum Relation {
  ME = 'ME',
  BROTHER = 'BROTHER',
  COUSIN = 'COUSIN',
  DAUGHTER = 'DAUGHTER',
  FATHER = 'FATHER',
  GRANDDAUGHTER = 'GRANDDAUGHTER',
  GRANDFATHER = 'GRANDFATHER',
  GRANDMOTHER = 'GRANDMOTHER',
  GRANDSON = 'GRANDSON',
  HUSBAND = 'HUSBAND',
  MOTHER = 'MOTHER',
  SISTER = 'SISTER',
  SON = 'SON',
  WIFE = 'WIFE',
  OTHER = 'OTHER',
}

export enum SEARCH_TYPE {
  DOCTOR = 'DOCTOR',
  SPECIALTY = 'SPECIALTY',
  MEDICINE = 'MEDICINE',
  TEST = 'TEST',
}

export enum MEDICINE_ORDER_STATUS {
  QUOTE = 'QUOTE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_INITIATED = 'ORDER_INITIATED',
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_VERIFIED = 'ORDER_VERIFIED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  PICKEDUP = 'PICKEDUP',
  RETURN_INITIATED = 'RETURN_INITIATED',
  ITEMS_RETURNED = 'ITEMS_RETURNED',
  RETURN_ACCEPTED = 'RETURN_ACCEPTED',
  PRESCRIPTION_UPLOADED = 'PRESCRIPTION_UPLOADED',
  ORDER_FAILED = 'ORDER_FAILED',
  PRESCRIPTION_CART_READY = 'PRESCRIPTION_CART_READY',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  CANCEL_REQUEST = 'CANCEL_REQUEST',
  READY_AT_STORE = 'READY_AT_STORE',
}

export enum UPLOAD_FILE_TYPES {
  JPG = 'JPG',
  PNG = 'PNG',
  JPEG = 'JPEG',
  PDF = 'PDF',
}

export enum PRISM_DOCUMENT_CATEGORY {
  HealthChecks = 'HealthChecks',
  OpSummary = 'OpSummary',
}

export enum DIAGNOSTICS_TYPE {
  TEST = 'TEST',
  PACKAGE = 'PACKAGE',
}

export enum TEST_COLLECTION_TYPE {
  HC = 'HC',
  CENTER = 'CENTER',
}

export enum MEDICINE_DELIVERY_TYPE {
  HOME_DELIVERY = 'HOME_DELIVERY',
  STORE_PICKUP = 'STORE_PICKUP',
}

export enum MEDICINE_ORDER_TYPE {
  UPLOAD_PRESCRIPTION = 'UPLOAD_PRESCRIPTION',
  CART_ORDER = 'CART_ORDER',
}

export enum MEDICINE_ORDER_PAYMENT_TYPE {
  COD = 'COD',
  NO_PAYMENT = 'NO_PAYMENT',
  CASHLESS = 'CASHLESS',
}

export enum BOOKING_SOURCE {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}

export enum DEVICE_TYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export enum PHARMA_CART_TYPE {
  CART = 'CART',
  NONCART = 'NONCART',
}

export enum DiscountType {
  FLATPRICE = 'FLATPRICE',
  PERCENT = 'PERCENT',
  PRICEOFF = 'PRICEOFF',
}

export enum MedicalTestUnit {
  GM = 'GM',
  _PERCENT_ = '_PERCENT_',
  GM_SLASH_DL = 'GM_SLASH_DL',
  NONE = 'NONE',
}

export enum MedicalRecordType {
  EHR = 'EHR',
  PHYSICAL_EXAMINATION = 'PHYSICAL_EXAMINATION',
  OPERATIVE_REPORT = 'OPERATIVE_REPORT',
  PATHOLOGY_REPORT = 'PATHOLOGY_REPORT',
  TEST_REPORT = 'TEST_REPORT',
  CONSULTATION = 'CONSULTATION ',
  PRESCRIPTION = 'PRESCRIPTION',
}

export enum DIAGNOSTIC_ORDER_STATUS {
  PICKUP_REQUESTED = 'PICKUP_REQUESTED',
  PICKUP_CONFIRMED = 'PICKUP_CONFIRMED',
  ORDER_FAILED = 'ORDER_FAILED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  ORDER_PLACED = 'ORDER_PLACED',
}
export enum DIAGNOSTIC_ORDER_PAYMENT_TYPE {
  COD = 'COD',
  ONLINE_PAYMENT = 'ONLINE_PAYMENT',
}

export enum FEEDBACKTYPE {
  CONSULT = 'CONSULT',
  PHARMACY = 'PHARMACY',
  DIAGNOSTICS = 'DIAGNOSTICS',
}

export enum LOGIN_TYPE {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

export enum OTP_STATUS {
  NOT_VERIFIED = 'NOT_VERIFIED',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  BLOCKED = 'BLOCKED',
}

enum customerTypeInCoupons {
  FIRST = 'FIRST',
  RECURRING = 'RECURRING',
}

//medicine orders starts
@Entity()
export class MedicineOrders extends BaseEntity {
  @Column({ nullable: true })
  apOrderNo: string;

  @Column({ nullable: true })
  appointmentId: string;

  @Column({ nullable: true })
  currentStatus: MEDICINE_ORDER_STATUS;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  devliveryCharges: number;

  @Column()
  deliveryType: MEDICINE_DELIVERY_TYPE;

  @Column({ default: BOOKING_SOURCE.MOBILE, nullable: true })
  bookingSource: BOOKING_SOURCE;

  @Column({ default: null, nullable: true })
  deviceType: DEVICE_TYPE;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedAmount: number;

  @Index('MedicineOrders_id')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  isEprescription: number;

  @PrimaryGeneratedColumn({ type: 'bigint' })
  orderAutoId: number;

  @Column()
  orderType: MEDICINE_ORDER_TYPE;

  @Column({ nullable: true, type: 'timestamp' })
  orderDateTime: Date;

  @Column({ nullable: true })
  orderTat: string;

  @Column({ nullable: true })
  patientAddressId: string;

  @Column({ nullable: true })
  prescriptionImageUrl: string;

  @Column({ nullable: true })
  prismPrescriptionFileId: string;

  @Column({ type: 'timestamp' })
  quoteDateTime: Date;

  @Column({ nullable: true })
  quoteId: string;

  @Column({ nullable: true })
  siteId: string;

  @Column({ nullable: true })
  shopId: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @Index('MedicineOrders_patientId')
  @ManyToOne((type) => Patient, (patient) => patient.medicineOrders)
  patient: Patient;

  @OneToMany(
    (type) => MedicineOrderLineItems,
    (medicineOrderLineItems) => medicineOrderLineItems.medicineOrders
  )
  medicineOrderLineItems: MedicineOrderLineItems[];

  @OneToMany(
    (type) => MedicineOrderInvoice,
    (medicineOrderInvoice) => medicineOrderInvoice.medicineOrders
  )
  medicineOrderInvoice: MedicineOrderInvoice[];

  @OneToMany(
    (type) => MedicineOrderPayments,
    (medicineOrderPayments) => medicineOrderPayments.medicineOrders
  )
  medicineOrderPayments: MedicineOrderPayments[];

  @OneToMany(
    (type) => MedicineOrdersStatus,
    (medicineOrdersStatus) => medicineOrdersStatus.medicineOrders
  )
  medicineOrdersStatus: MedicineOrdersStatus[];
}
//medicine orders ends

//medicine orders  line items start
@Entity()
export class MedicineOrderLineItems extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  isMedicine: string;

  @Column({ default: 0 })
  isPrescriptionNeeded: number;

  @Column()
  medicineSKU: string;

  @Column()
  medicineName: string;

  @Column()
  mou: number;

  @Column('decimal', { precision: 10, scale: 2 })
  mrp: number;

  @Column({ nullable: true })
  prescriptionImageUrl: string;

  @Column({ nullable: true })
  prismPrescriptionFileId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderLineItems)
  medicineOrders: MedicineOrders;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//medicine orders line items ends

//medicine orders  payments start
@Entity()
export class MedicineOrderPayments extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amountPaid: number;

  @Column({ nullable: true })
  bankTxnId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;

  @Column({ nullable: true })
  paymentRefId: string;

  @Column({ nullable: true })
  paymentDateTime: Date;

  @Column()
  paymentStatus: string;

  @Column({ nullable: true })
  responseCode: string;

  @Column({ nullable: true })
  responseMessage: string;

  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderPayments)
  medicineOrders: MedicineOrders;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//medicine orders payments ends

//medicine orders status starts
@Entity()
export class MedicineOrdersStatus extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrdersStatus)
  medicineOrders: MedicineOrders;

  @Column()
  orderStatus: MEDICINE_ORDER_STATUS;

  @Column({ nullable: true, default: true })
  hideStatus: boolean;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  statusDate: Date;

  @Column({ nullable: true })
  statusMessage: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//medicine orders status ends

//medicine orders invoice starts
@Entity()
export class MedicineOrderInvoice extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderInvoice)
  medicineOrders: MedicineOrders;

  @Column()
  orderNo: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  empId: string;

  @Column({ nullable: true })
  siteId: string;

  @Column({ nullable: true })
  docnum: string;

  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  requestType: string;

  @Column({ nullable: true })
  vendorName: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true, type: 'json' })
  billDetails: string;

  @Column({ nullable: true, type: 'json' })
  itemDetails: string;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }
}
//medicine orders invoice ends

//patient device tokens starts
@Entity()
export class PatientDeviceTokens extends BaseEntity {
  @ManyToOne((type) => Patient, (patient) => patient.patientDeviceTokens)
  patient: Patient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'text' })
  deviceToken: string;

  @Column()
  deviceOS: string;

  @Column()
  deviceType: DEVICE_TYPE;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patient device token ends

//patient Starts
@Entity()
export class Patient extends BaseEntity {
  @Column({ default: null, nullable: true })
  deviceCode: string;

  @Column({ nullable: true })
  androidVersion: string;

  @Column({ nullable: true, type: 'text' })
  allergies: string;

  @Column({ nullable: true, type: 'text' })
  athsToken: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  @IsOptional()
  emailAddress: string;

  @OneToMany((type) => PatientFamilyHistory, (familyHistory) => familyHistory.patient)
  familyHistory: PatientFamilyHistory[];

  @Column({ nullable: true })
  firebaseUid: string;

  @Column()
  @Validate(NameValidator)
  firstName: string;

  @Column({ nullable: true })
  gender: Gender;

  @OneToMany((type) => PatientHealthVault, (healthVault) => healthVault.patient)
  healthVault: PatientHealthVault[];

  @Index('Patient_id')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  iosVersion: string;

  @OneToMany((type) => PatientLifeStyle, (lifeStyle) => lifeStyle.patient)
  lifeStyle: PatientLifeStyle[];

  @OneToMany((type) => MedicineOrders, (medicineOrders) => medicineOrders.patient)
  medicineOrders: MedicineOrders[];

  @OneToMany((type) => DiagnosticOrders, (diagnosticOrders) => diagnosticOrders.patient)
  diagnosticOrders: DiagnosticOrders[];

  @OneToMany((type) => MedicalRecords, (medicalRecords) => medicalRecords.patient)
  medicalRecords: MedicalRecords[];

  @OneToMany((type) => PatientFeedback, (patientfeedback) => patientfeedback.patient)
  patientfeedback: PatientFeedback[];

  @Index('Patient_mobileNumber')
  @Column()
  @Validate(MobileNumberValidator)
  mobileNumber: string;

  @OneToMany((type) => PatientAddress, (patientAddress) => patientAddress.patient)
  patientAddress: PatientAddress[];

  @OneToMany((type) => PatientDeviceTokens, (patientDeviceTokens) => patientDeviceTokens.patient)
  patientDeviceTokens: PatientDeviceTokens[];

  @OneToOne(
    (type) => PatientNotificationSettings,
    (patientNotificationSettings) => patientNotificationSettings.patient
  )
  patientNotificationSettings: PatientNotificationSettings;

  @OneToOne(
    (type) => PatientMedicalHistory,
    (patientMedicalHistory) => patientMedicalHistory.patient
  )
  patientMedicalHistory: PatientMedicalHistory;

  @OneToOne((type) => RegistrationCodes, (registrationCodes) => registrationCodes.patient)
  registrationCodes: RegistrationCodes;

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @Column({ nullable: true })
  uhid: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  relation: Relation;

  @Index('Patient_isActive')
  @Column({ nullable: true, default: true })
  isActive: Boolean;

  @OneToMany((type) => SearchHistory, (searchHistory) => searchHistory.patient)
  searchHistory: SearchHistory[];

  @OneToMany((type) => PatientHelpTickets, (patientHelpTickets) => patientHelpTickets.patient)
  patientHelpTickets: PatientHelpTickets[];

  @Column({ nullable: true })
  updatedDate: Date;

  @Column({ nullable: true })
  uhidCreatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patient Ends

//patient reg codes starts
@Entity()
export class RegistrationCodes extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('RegistrationCodes_registrationCode')
  @Column()
  registrationCode: string;

  @Column({ default: REGISTRATION_CODES_STATUS.NOT_SENT })
  codeStatus: REGISTRATION_CODES_STATUS;

  @OneToOne((type) => Patient, (patient) => patient.registrationCodes)
  @JoinColumn()
  patient: Patient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patient reg codes ends

//searchHistory Starts
@Entity()
export class SearchHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: SEARCH_TYPE;

  @Column()
  typeId: string;

  @Column({ nullable: true })
  typeName: string;

  @ManyToOne((type) => Patient, (patient) => patient.searchHistory)
  patient: Patient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
//searchHistory Ends

//patientAddress Starts
@Entity()
export class PatientAddress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  addressType: PATIENT_ADDRESS_TYPE;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  mobileNumber: string;

  @Column({ nullable: true })
  otherAddressType: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  zipcode: string;

  @Column({ nullable: true })
  landmark: string;

  @ManyToOne((type) => Patient, (patient) => patient.patientAddress)
  patient: Patient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patientAddress Ends

//patient family history starts
@Entity()
export class PatientFamilyHistory extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => Patient, (patient) => patient.familyHistory)
  patient: Patient;

  @Column({ nullable: true })
  relation: Relation;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patient family history ends

//patientLifeStyle starts
@Entity()
export class PatientLifeStyle extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => Patient, (patient) => patient.lifeStyle)
  patient: Patient;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patientLifestyle ends

//patientHealthVault starts
@Entity()
export class PatientHealthVault extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  imageUrls: string;

  @ManyToOne((type) => Patient, (patient) => patient.healthVault)
  patient: Patient;

  @Column({ nullable: true, type: 'text' })
  reportUrls: string;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patientHealthVault ends

//patient notification settings starts
@Entity()
export class PatientNotificationSettings extends BaseEntity {
  @Column({ default: false })
  commissionNotification: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  messageFromDoctorNotification: boolean;

  @OneToOne((type) => Patient, (patient) => patient.patientNotificationSettings)
  @JoinColumn()
  patient: Patient;

  @Column({ default: false })
  playNotificationSound: boolean;

  @Column({ default: false })
  reScheduleAndCancellationNotification: boolean;

  @Column({ default: false })
  paymentNotification: boolean;

  @Column({ default: false })
  upcomingAppointmentReminders: boolean;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patient notification settings ends

//MedicalRecords starts
@Entity()
export class MedicalRecords extends BaseEntity {
  @Column({ nullable: true, type: 'text' })
  additionalNotes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  documentURLs: string;

  @Column({ nullable: true })
  issuingDoctor: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, type: 'text' })
  prismFileIds: string;

  @OneToMany(
    (type) => MedicalRecordParameters,
    (medicalRecordParameters) => medicalRecordParameters.medicalRecords
  )
  medicalRecordParameters: MedicalRecordParameters[];

  @Column({ nullable: true, type: 'text' })
  observations: string;

  @ManyToOne((type) => Patient, (patient) => patient.medicalRecords)
  patient: Patient;

  @Column()
  recordType: MedicalRecordType;

  @Column({ nullable: true })
  referringDoctor: string;

  @Column({ nullable: true })
  sourceName: string;

  @Column()
  testName: string;

  @Column()
  testDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//MedicalRecords ends

//MedicalRecordParameters starts
@Entity()
export class MedicalRecordParameters extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 5, scale: 2 })
  maximum: number;

  @ManyToOne((type) => MedicalRecords, (medicalRecords) => medicalRecords.medicalRecordParameters)
  medicalRecords: MedicalRecords;

  @Column('decimal', { precision: 5, scale: 2 })
  minimum: number;

  @Column()
  parameterName: string;

  @Column('decimal', { precision: 5, scale: 2 })
  result: number;

  @Column()
  unit: MedicalTestUnit;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//MedicalRecordParameters ends

//Coupon starts
@Entity()
export class Coupon extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'text' })
  code: string;

  @ManyToOne((type) => CouponConsultRules, (couponConsultRule) => couponConsultRule.coupon)
  couponConsultRule: CouponConsultRules;

  @ManyToOne((type) => CouponGenericRules, (couponGenericRule) => couponGenericRule.coupon)
  couponGenericRule: CouponGenericRules;

  @OneToMany((type) => ReferalCouponMapping, (referalCouponMapping) => referalCouponMapping.coupon)
  referalCouponMapping: ReferalCouponMapping[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isActive: Boolean;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Coupon ends

//Consult Coupon Rules starts
@Entity()
export class CouponGenericRules extends BaseEntity {
  @OneToMany((type) => Coupon, (coupon) => coupon.couponGenericRule)
  coupon: Coupon[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  couponApplicableCustomerType: customerTypeInCoupons;

  @Column({ nullable: true })
  couponReuseCount: number;

  @Column({ nullable: true })
  couponReuseCountPerCustomer: number;

  @Column({ nullable: true })
  couponStartDate: Date;

  @Column({ nullable: true })
  couponEndDate: Date;

  @Column({ nullable: true })
  couponDueDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isActive: Boolean;

  @Column({ type: 'float8', nullable: true })
  minimumCartValue: number;

  @Column({ type: 'float8', nullable: true })
  maximumCartValue: number;

  @Column({ type: 'text', nullable: true })
  discountType: DiscountType;

  @Column({ type: 'float8', nullable: true })
  discountValue: number;

  @Column({ default: 1 })
  numberOfCouponsNeeded: number; //single or series

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Consult Coupon Rules ends

//Consult Coupon Rules starts
@Entity()
export class CouponConsultRules extends BaseEntity {
  @OneToMany((type) => Coupon, (coupon) => coupon.couponConsultRule)
  coupon: Coupon[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'text', default: ConsultMode.BOTH })
  couponApplicability: ConsultMode;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isActive: Boolean;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Consult Coupon Rules ends

//patientMedicalHistory starts
@Entity()
export class PatientMedicalHistory extends BaseEntity {
  @Column({ nullable: true })
  bp: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true, type: 'text' })
  dietAllergies: string;

  @Column({ nullable: true, type: 'text' })
  drugAllergies: string;

  @Column({ nullable: true })
  height: string;

  @Column({ nullable: true, type: 'text' })
  menstrualHistory: string;

  @Column({ nullable: true, type: 'text' })
  pastMedicalHistory: string;

  @Column({ nullable: true, type: 'text' })
  pastSurgicalHistory: string;

  @OneToOne((type) => Patient, (patient) => patient.patientMedicalHistory)
  @JoinColumn()
  patient: Patient;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  temperature: string;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @Column({ nullable: true })
  weight: string;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//patientMedicalHistory ends

// Diagnostics
@Entity()
export class Diagnostics extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: 0 })
  itemId: number;

  @Column({ nullable: true })
  itemName: string;

  @Column({ nullable: true })
  itemCode: string;

  @Column({ nullable: true })
  itemAliasName: string;

  @Column({ nullable: true })
  fromAgeInDays: number;

  @Column({ nullable: true })
  toAgeInDays: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  labName: string;

  @Column({ nullable: true })
  labCode: string;

  @Column({ nullable: true })
  labID: number;

  @Column('decimal', { precision: 10, scale: 2 })
  rate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  scheduleRate: number;

  @Column({ nullable: true, type: 'timestamp' })
  fromDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  toDate: Date;

  @Column({ nullable: true })
  itemType: DIAGNOSTICS_TYPE;

  @Column({ nullable: true })
  testInPackage: number;

  @Column({ nullable: true })
  NABL_CAP: string;

  @Column({ nullable: true })
  itemRemarks: string;

  @Column({ nullable: true })
  discounted: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  stateId: number;

  @Column({ nullable: true })
  cityId: number;

  @Column({ default: TEST_COLLECTION_TYPE.HC })
  collectionType: TEST_COLLECTION_TYPE;

  @Column({ nullable: true })
  testPreparationData: string;

  @OneToMany((type) => DiagnosticOrgans, (diagnosticOrgans) => diagnosticOrgans.diagnostics)
  diagnosticOrgans: DiagnosticOrgans[];

  @OneToMany(
    (type) => DiagnosticHotSellers,
    (diagnosticHotSellers) => diagnosticHotSellers.diagnostics
  )
  diagnosticHotSellers: DiagnosticHotSellers[];

  @OneToMany(
    (type) => DiagnosticOrderLineItems,
    (diagnosticOrderLineItems) => diagnosticOrderLineItems.diagnosticOrders
  )
  diagnosticOrderLineItems: DiagnosticOrderLineItems[];
}

// Diagnostic orders
@Entity()
export class DiagnosticOrders extends BaseEntity {
  @Index('DiagnosticOrders_id')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientAddressId: string;

  @Column()
  city: string;

  @Column({ default: BOOKING_SOURCE.MOBILE, nullable: true })
  bookingSource: BOOKING_SOURCE;

  @Column({ default: null, nullable: true })
  deviceType: DEVICE_TYPE;

  @Column()
  diagnosticBranchCode: string;

  @Column()
  diagnosticDate: Date;

  @Column()
  diagnosticEmployeeCode: string;

  @Column()
  employeeSlotId: number;

  @Column()
  slotTimings: string;

  @Column({ nullable: true })
  fareyeId: string;

  @Column({ nullable: true })
  preBookingId: string;

  @Column({ nullable: true })
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE;

  @Column({ default: TEST_COLLECTION_TYPE.HC })
  orderType: TEST_COLLECTION_TYPE;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED })
  orderStatus: DIAGNOSTIC_ORDER_STATUS;

  @Column({ generated: 'increment' })
  displayId: number;

  @Column({ nullable: true })
  prescriptionUrl: string;

  @Column({ nullable: true })
  prismPrescriptionFileId: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0.0 })
  collectionCharges: number;

  @Column({ nullable: true })
  centerCode: string;

  @Column({ nullable: true })
  centerName: string;

  @Column({ nullable: true })
  centerCity: string;

  @Column({ nullable: true })
  centerLocality: string;

  @Column({ nullable: true })
  centerState: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @Index('DiagnosticOrders_patientId')
  @ManyToOne((type) => Patient, (patient) => patient.diagnosticOrders)
  patient: Patient;

  @OneToMany(
    (type) => DiagnosticOrderLineItems,
    (diagnosticOrderLineItems) => diagnosticOrderLineItems.diagnosticOrders
  )
  diagnosticOrderLineItems: DiagnosticOrderLineItems[];

  @OneToMany(
    (type) => DiagnosticOrderPayments,
    (diagnosticOrderPayments) => diagnosticOrderPayments.diagnosticOrders
  )
  diagnosticOrderPayments: DiagnosticOrderPayments[];

  @OneToMany(
    (type) => DiagnosticOrdersStatus,
    (diagnosticOrdersStatus) => diagnosticOrdersStatus.diagnosticOrders
  )
  diagnosticOrdersStatus: DiagnosticOrdersStatus[];
}

//diagnostic orders  payments start
@Entity()
export class DiagnosticOrderPayments extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amountPaid: number;

  @Column({ nullable: true })
  bankCode: string;

  @Column({ nullable: true })
  bankRefNum: string;

  @Column({ nullable: true })
  cardType: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  discount: string;

  @Column({ nullable: true })
  errorCode: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  hash: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  issuingBank: string;

  @Column({ nullable: true })
  mihpayid: string;

  @Column({ nullable: true })
  mode: string;

  @Column({ nullable: true })
  netAmountDebit: string;

  @Column({ nullable: true })
  paymentDateTime: Date;

  @Column()
  paymentStatus: string;

  @Column({ nullable: true })
  paymentSource: string;

  @Column({ nullable: true })
  txnId: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @ManyToOne(
    (type) => DiagnosticOrders,
    (diagnosticOrders) => diagnosticOrders.diagnosticOrderPayments
  )
  diagnosticOrders: DiagnosticOrders;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//diagnostic order payment ends

//diagnostic orders  line items start
@Entity()
export class DiagnosticOrderLineItems extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    (type) => DiagnosticOrders,
    (diagnosticOrders) => diagnosticOrders.diagnosticOrderLineItems
  )
  diagnosticOrders: DiagnosticOrders;

  @ManyToOne((type) => Diagnostics, (diagnostics) => diagnostics.diagnosticOrderLineItems)
  diagnostics: Diagnostics;

  @Column()
  itemId: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'timestamp', nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}

//diagnostic orders status starts
@Entity()
export class DiagnosticOrdersStatus extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne(
    (type) => DiagnosticOrders,
    (diagnosticOrders) => diagnosticOrders.diagnosticOrdersStatus
  )
  diagnosticOrders: DiagnosticOrders;

  @Column()
  orderStatus: DIAGNOSTIC_ORDER_STATUS;

  @Column({ nullable: true, default: true })
  hideStatus: boolean;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  statusDate: Date;

  @Column({ nullable: true })
  statusMessage: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Diagnostic orders status ends

@Entity()
export class DiagnosticOrgans extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organName: string;

  @Column({ nullable: true })
  organImage: string;

  @Column()
  itemId: number;

  @Column({ default: true })
  isActive: Boolean;

  @ManyToOne((type) => Diagnostics, (diagnostics) => diagnostics.diagnosticOrgans)
  diagnostics: Diagnostics;
}

@Entity()
export class DiagnosticHotSellers extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  packageName: string;

  @Column({ nullable: true })
  packageImage: string;

  @Column({ default: true })
  isActive: Boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  itemId: number;

  @ManyToOne((type) => Diagnostics, (diagnostics) => diagnostics.diagnosticHotSellers)
  diagnostics: Diagnostics;
}

@Entity()
export class DiagnosticPincodeHubs extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  route: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  pincode: number;

  @Column({ nullable: true })
  pincodeAreaname: string;

  @Column({ nullable: true })
  pccDropPoint: string;

  @Column({ nullable: true })
  pccEmail: string;

  @Column({ nullable: true })
  areaName: string;
}

@Entity()
export class PatientFeedback extends BaseEntity {
  @ManyToOne((type) => Patient, (patient) => patient.id)
  patient: Patient;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rating: string;

  @Column({ type: 'text' })
  thankyouNote: string;

  @Column()
  reason: string;

  @Column()
  feedbackType: FEEDBACKTYPE;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}

@Entity()
export class PatientHelpTickets extends BaseEntity {
  @ManyToOne((type) => Patient, (patient) => patient.id)
  patient: Patient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column({ type: 'text' })
  comments: string;

  @Column()
  reason: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}

@Entity()
export class LoginOtp extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Index('LoginOtp_id')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('LoginOtp_loginType')
  @Column()
  loginType: LOGIN_TYPE;

  @Index('LoginOtp_mobileNumber')
  @Column()
  mobileNumber: string;

  @Index('LoginOtp_otp')
  @Column()
  otp: string;

  @Column({ default: OTP_STATUS.NOT_VERIFIED })
  status: string;

  @Column({ default: 0 })
  incorrectAttempts: number;

  @Column({ nullable: true })
  updatedDate: Date;
}

@Entity()
export class LoginOtpArchive extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  loginType: LOGIN_TYPE;

  @Column()
  mobileNumber: string;

  @Column()
  otp: string;

  @Column({ default: OTP_STATUS.NOT_VERIFIED })
  status: string;

  @Column({ default: 0 })
  incorrectAttempts: number;

  @Column({ nullable: true })
  updatedDate: Date;
}

@Entity()
export class ReferralCodesMaster extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @OneToMany(
    (type) => ReferalCouponMapping,
    (referalCouponMapping) => referalCouponMapping.referralCodesMaster
  )
  referalCouponMapping: ReferalCouponMapping[];

  @Column({ nullable: true })
  updatedDate: Date;
}

@Entity()
export class ReferalCouponMapping extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    (type) => ReferralCodesMaster,
    (ReferralCodesMaster) => ReferralCodesMaster.referalCouponMapping
  )
  referralCodesMaster: ReferralCodesMaster;

  @ManyToOne((type) => Coupon, (coupon) => coupon.referalCouponMapping)
  coupon: Coupon;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
