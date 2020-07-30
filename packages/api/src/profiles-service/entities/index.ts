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
  AfterUpdate,
  AfterInsert,
} from 'typeorm';
import { Validate, IsOptional } from 'class-validator';
import { NameValidator, MobileNumberValidator } from 'validators/entityValidators';
import { ConsultMode } from 'doctors-service/entities';
import { BlockUserPointsResponse } from 'types/oneApolloTypes';
import { getCache, setCache, delCache } from 'profiles-service/database/connectRedis';
import { ApiConstants } from 'ApiConstants';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export type ONE_APOLLO_USER_REG = {
  FirstName: string;
  LastName: string;
  MobileNumber: string;
  Gender: Gender;
  BusinessUnit: string;
  StoreCode: string;
  CustomerId: string;
};

export enum ONE_APOLLO_PRODUCT_CATEGORY {
  PRIVATE_LABEL = 'A247',
  NON_PHARMA = 'F247',
  PHARMA = 'P247',
}

export type OneApollTransaction = {
  BillNo: string;
  BU: string;
  StoreCode: string;
  NetAmount: number;
  GrossAmount: number;
  TransactionDate: Date;
  MobileNumber: string;
  SendCommunication: boolean;
  CalculateHealthCredits: boolean;
  Gender: Gender;
  Discount: number;
  TransactionLineItems: Partial<TransactionLineItems>[];
};

export type TransactionLineItems = {
  ProductCode: string;
  ProductName: string;
  ProductCategory: ONE_APOLLO_PRODUCT_CATEGORY;
  NetAmount: number;
  GrossAmount: number;
  DiscountAmount: number;
};

export enum CouponApplicability {
  CONSULT = 'CONSULT',
  PHARMACY = 'PHARMACY',
}

export enum CouponCategoryApplicable {
  PHARMA = 'PHARMA',
  FMCG = 'FMCG',
  PHARMA_FMCG = 'PHARMA_FMCG',
}

export enum PharmaDiscountApplicableOn {
  MRP = 'MRP',
  SPECIAL_PRICE = 'SPECIAL_PRICE',
}

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
export enum PAYMENT_STATUS_MAP {
  TXN_SUCCESS = 'PAYMENT_SUCCESS',
  PENDING = 'PAYMENT_PENDING_PG',
  TXN_FAILURE = 'PAYMENT_FAILED',
  PAYMENT_ABORTED = 'PAYMENT_ABORTED',
  UNKNOWN = 'PAYMENT_STATUS_NOT_KNOWN',
}

export enum STATUS_PAYMENT_MAP {
  PAYMENT_SUCCESS = 'TXN_SUCCESS',
  PAYMENT_PENDING_PG = 'PENDING',
  PAYMENT_FAILED = 'TXN_FAILURE',
  PAYMENT_ABORTED = 'PAYMENT_ABORTED',
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
  PAYMENT_PENDING = 'PAYMENT_PENDING',
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
  ORDER_BILLED = 'ORDER_BILLED',
  PURCHASED_IN_STORE = 'PURCHASED_IN_STORE',
  PAYMENT_ABORTED = 'PAYMENT_ABORTED',
}

export enum UPLOAD_FILE_TYPES {
  JPG = 'JPG',
  PNG = 'PNG',
  JPEG = 'JPEG',
  PDF = 'PDF',
}

export enum PRISM_DOCUMENT_CATEGORY {
  HealthChecks = 'HealthChecks', //not using now
  OpSummary = 'OpSummary',
  TestReports = 'TestReports',
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
  ORDER_PUNCHING_TOOL = 'ORDER_PUNCHING_TOOL',
  MFINE = 'MFINE',
}

export enum DEVICE_TYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  DESKTOP = 'DESKTOP',
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

export enum PAYMENT_METHODS {
  DC = 'DEBIT_CARD',
  CC = 'CREDIT_CARD',
  NB = 'NET_BANKING',
  PPI = 'PAYTM_WALLET',
  EMI = 'CREDIT_CARD_EMI',
  UPI = 'UPI',
  PAYTMCC = 'PAYTM_POSTPAID',
  COD = 'COD',
}

export enum PAYMENT_METHODS_REVERSE {
  DEBIT_CARD = 'DC',
  CREDIT_CARD = 'CC',
  NET_BANKING = 'NB',
  PAYTM_WALLET = 'PPI',
  CREDIT_CARD_EMI = 'EMI',
  UPI = 'UPI',
  PAYTM_POSTPAID = 'PAYTMCC',
  COD = 'COD',
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
// REDUND and PAYTM STATUS also same defined in consults-service
export enum REFUND_STATUS {
  REFUND_REQUEST_RAISED = 'REFUND_REQUEST_RAISED',
  REFUND_FAILED = 'REFUND_FAILED',
  REFUND_SUCCESSFUL = 'REFUND_SUCCESSFUL',
  REFUND_REQUEST_NOT_RAISED = 'REFUND_REQUEST_NOT_RAISED',
}

export enum PAYTM_STATUS {
  TXN_FAILURE = 'TXN_FAILURE',
  PENDING = 'PENDING',
  TXN_SUCCESS = 'TXN_SUCCESS',
  PAYMENT_ABORTED = 'PAYMENT_ABORTED',
}

enum customerTypeInCoupons {
  FIRST = 'FIRST',
  RECURRING = 'RECURRING',
}

export enum PROFILE_SOURCE {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  ORDER_PUNCHING_TOOL = 'ORDER_PUNCHING_TOOL',
  MFINE = 'MFINE',
}

//medicine orders starts
@Entity()
export class MedicineOrders extends BaseEntity {
  @Index()
  @Column({ nullable: true })
  apOrderNo: string;

  @Column({ nullable: true })
  referenceNo: string;

  @Index()
  @Column({ nullable: true })
  appointmentId: string;

  @Column({ nullable: true })
  coupon: string;

  @Index()
  @Column({ nullable: true })
  currentStatus: MEDICINE_ORDER_STATUS;

  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  devliveryCharges: number;

  @Column({ type: 'float8', nullable: true })
  packagingCharges: number;

  @Column()
  deliveryType: MEDICINE_DELIVERY_TYPE;

  @Column({ default: BOOKING_SOURCE.MOBILE })
  bookingSource: BOOKING_SOURCE;

  @Column({ default: null })
  deviceType: DEVICE_TYPE;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedAmount: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  isEprescription: number;

  @Index('MedicineOrders_orderAutoId')
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

  @Column({ nullable: true })
  showPrescriptionAtStore: boolean;

  @Column({ type: 'timestamp' })
  quoteDateTime: Date;

  @Column({ nullable: true })
  quoteId: string;

  @Column({ nullable: true })
  siteId: string;

  @Column({ nullable: true })
  shopId: string;

  @Column({ type: 'float8', nullable: true })
  couponDiscount: number;

  @Column({ type: 'float8', nullable: true })
  productDiscount: number;

  @Column({
    nullable: true,
    type: 'json',
  })
  shopAddress: string;

  @Column({ default: false, nullable: true })
  alertStore: boolean;

  @Column({
    nullable: true,
    type: 'jsonb',
    array: false,
    name: 'paymentInfo',
    default: () => "'{}'",
  })
  paymentInfo: Partial<MedicineOrderPayments>;

  @Column({ nullable: true })
  customerComment: string;

  @Column({ nullable: true })
  isOmsOrder: boolean;

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

  // to be removed with oms
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

  // to be removed with oms
  @OneToMany(
    (type) => MedicineOrdersStatus,
    (medicineOrdersStatus) => medicineOrdersStatus.medicineOrders
  )
  medicineOrdersStatus: MedicineOrdersStatus[];

  @OneToMany(
    (type) => MedicineOrderShipments,
    (medicineOrderShipments) => medicineOrderShipments.medicineOrders
  )
  medicineOrderShipments: MedicineOrderShipments[];

  @OneToMany(
    (type) => MedicineOrderRefunds,
    (medicineOrderRefunds) => medicineOrderRefunds.medicineOrders
  )
  medicineOrderRefunds: MedicineOrderRefunds[];

  @OneToOne(
    (type) => MedicineOrderAddress,
    (medicineOrderAddress) => medicineOrderAddress.medicineOrders
  )
  medicineOrderAddress: MedicineOrderAddress;
}
//medicine orders ends

//medicine order address starts
@Entity()
export class MedicineOrderAddress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  mobileNumber: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  addressType: PATIENT_ADDRESS_TYPE;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  otherAddressType: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: true })
  landmark: string;

  @Column({ type: 'float8', nullable: true })
  latitude: number;

  @Column({ type: 'float8', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  stateCode: string;

  @OneToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderAddress)
  @JoinColumn()
  medicineOrders: MedicineOrders;

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
//medicine order address ends

//Medicine Orders Refunds Start
@Entity()
export class MedicineOrderRefunds extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  refId: string;

  @Column({ nullable: false })
  txnId: string;

  @Column('decimal', { precision: 10, scale: 5, nullable: false })
  refundAmount: number;

  @Column({ nullable: true })
  totalRefundAmount: number;

  @Column({ nullable: true, type: 'text' })
  comments: string;

  @Column('enum', {
    nullable: false,
    default: REFUND_STATUS.REFUND_REQUEST_NOT_RAISED,
    enum: REFUND_STATUS,
  })
  refundStatus: REFUND_STATUS;

  @Column('enum', { nullable: true, enum: PAYTM_STATUS })
  paytmRequestStatus: PAYTM_STATUS;

  @Column({ nullable: true })
  refundId: string;

  @Column({ nullable: true })
  txnAmount: number;

  @Column({ nullable: true })
  txnTimestamp: Date;

  @Column({ nullable: false })
  orderId: string;

  @Column({ nullable: true })
  payMethod: string;

  @Column({ nullable: true })
  acceptRefundTimestamp: Date;

  @Column({ nullable: true })
  userCreditInitiateTimestamp: Date;

  @Column({ nullable: true })
  resultCode: string;

  @Column({ type: 'text', nullable: true })
  resultMsg: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedDate: Date;

  @Column({
    nullable: true,
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
  })
  refundDetailInfo: JSON;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @ManyToOne(() => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderRefunds)
  medicineOrders: MedicineOrders;

  @ManyToOne(
    () => MedicineOrderPayments,
    (medicineOrderPayments) => medicineOrderPayments.medicineOrderRefunds
  )
  medicineOrderPayments: MedicineOrderPayments;
}
//Medicine Refunds ends

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

  @Column({ type: 'float8', nullable: true })
  itemDiscount: number;

  @Column({ type: 'float8', nullable: true })
  itemValue: number;

  @Column()
  quantity: number;

  @Index('MedicineOrderLineItems_MedicineOrderId')
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

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ nullable: true })
  bankTxnId: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;

  @Column({ nullable: true })
  paymentMode: PAYMENT_METHODS_REVERSE;

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

  @Column({
    nullable: true,
    type: 'jsonb',
    array: false,
    name: 'healthCreditsRedemptionRequest',
    default: () => "'{}'",
  })
  healthCreditsRedemptionRequest: Partial<BlockUserPointsResponse>;

  @Column('decimal', { precision: 10, scale: 2, nullable: false, default: 0 })
  healthCreditsRedeemed: number;

  @Index('MedicineOrderPayments_medicineOrderId')
  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderPayments)
  medicineOrders: MedicineOrders;

  @OneToMany(
    (type) => MedicineOrderRefunds,
    (medicineOrderRefunds) => medicineOrderRefunds.medicineOrderPayments
  )
  medicineOrderRefunds: MedicineOrderRefunds[];

  @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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

  @Index('MedicineOrdersStatus_MedicineOrderId')
  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrdersStatus)
  medicineOrders: MedicineOrders;

  @ManyToOne(
    (type) => MedicineOrderShipments,
    (medicineOrderShipments) => medicineOrderShipments.medicineOrdersStatus
  )
  medicineOrderShipments: MedicineOrderShipments;

  @Column()
  orderStatus: MEDICINE_ORDER_STATUS;

  @Column({ nullable: true, default: true })
  hideStatus: boolean;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamp' })
  statusDate: Date;

  @Column({ nullable: true })
  statusMessage: string;

  @Column({ nullable: true })
  customReason: string;

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

  @Index('MedicineOrderInvoice_MedicineOrderId')
  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderInvoice)
  medicineOrders: MedicineOrders;

  @Index('MedicineOrderInvoice_medicineOrderShipmentId')
  @ManyToOne(
    (type) => MedicineOrderShipments,
    (medicineOrderShipments) => medicineOrderShipments.medicineOrderInvoice
  )
  medicineOrderShipments: MedicineOrderShipments;

  @Index('MedicineOrderInvoice_orderNo')
  @Column()
  orderNo: number;

  @Column()
  apOrderNo: string;

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
  @Index('PatientDeviceTokens_PatientId')
  @ManyToOne((type) => Patient, (patient) => patient.patientDeviceTokens)
  patient: Patient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Index('device_token')
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
  @Index()
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

  @Index()
  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  partnerId: string;

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

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false, nullable: true })
  isLinked: Boolean;

  @Column({ default: false, nullable: true })
  isUhidPrimary: Boolean;

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

  @OneToMany(
    (type) => PharmacologistConsult,
    (pharmacologistConsult) => pharmacologistConsult.patient
  )
  pharmacologistConsult: PharmacologistConsult[];

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

  @Index('Patient_primaryUhid')
  @Column({ nullable: true })
  primaryUhid: string;

  @Index('Patient_primaryPatientId')
  @Column({ nullable: true })
  primaryPatientId: string;

  @Index('Patient_uhid')
  @Column({ nullable: true })
  uhid: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  relation: Relation;

  @Column({ nullable: true })
  source: PROFILE_SOURCE;

  @Column({ nullable: true, default: true })
  isActive: Boolean;

  @Column({ default: false })
  whatsAppConsult: Boolean;

  @Column({ default: false })
  whatsAppMedicine: Boolean;

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
  @AfterInsert()
  async updatePatientMobileCache() {
    const mobileIdList: string | null = await getCache(`patient:mobile:${this.mobileNumber}`);
    if (mobileIdList) {
      const listOfId = `${mobileIdList},${this.id}`; //value of cache is comma saperated value of ids
      await setCache(
        `patient:mobile:${this.mobileNumber}`,
        listOfId,
        ApiConstants.CACHE_EXPIRATION_3600
      );
    }
  }

  @AfterInsert()
  @AfterUpdate()
  async setPatientCache() {
    await setCache(`patient:${this.id}`, JSON.stringify(this), ApiConstants.CACHE_EXPIRATION_3600);
  }
}
//patient Ends

//patient reg codes starts
@Entity()
export class RegistrationCodes extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Index()
  @Column()
  typeId: string;

  @Column({ nullable: true })
  typeName: string;

  @Index('SearchHistory_PatientId')
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

  @Column({ type: 'float8', nullable: true })
  latitude: number;

  @Column({ type: 'float8', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  stateCode: string;

  @Index('PatientAddress_PatientId')
  @ManyToOne((type) => Patient, (patient) => patient.patientAddress)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('string', { nullable: true })
  patientId: string;

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
    if (this.addressLine1 == '' || this.addressLine1 == null) {
      throw new AphError(AphErrorMessages.INVALID_ADDRESS_DETAILS);
    }
  }

  @AfterInsert()
  @AfterUpdate()
  async dropPatientAddressList() {
    await delCache(`address:list:patient:${this.patientId}`);
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

  @Index('PatientFamilyHistory_PatientId')
  @ManyToOne((type) => Patient, (patient) => patient.familyHistory)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('string', { nullable: true })
  patientId: string;

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

  @Column({ nullable: true })
  occupationHistory: string;

  @Index('PatientLifeStyle_PatientId')
  @ManyToOne((type) => Patient, (patient) => patient.lifeStyle)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('string', { nullable: true })
  patientId: string;

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

  @Index('PatientHealthVault_PatientId')
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

  @Index()
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

  @Index('Coupon_code')
  @Column({ type: 'text' })
  code: string;

  @Column({ default: CouponApplicability.CONSULT })
  couponApplicability: CouponApplicability;

  @Index('Coupon_couponConsultRuleId')
  @ManyToOne((type) => CouponConsultRules, (couponConsultRule) => couponConsultRule.coupon)
  couponConsultRule: CouponConsultRules;

  @Index('Coupon_couponGenericRuleId')
  @ManyToOne((type) => CouponGenericRules, (couponGenericRule) => couponGenericRule.coupon)
  couponGenericRule: CouponGenericRules;

  @Index('Coupon_couponPharmaRuleId')
  @ManyToOne((type) => CouponPharmaRules, (couponPharmaRule) => couponPharmaRule.coupon)
  couponPharmaRule: CouponPharmaRules;

  @OneToMany((type) => ReferalCouponMapping, (referalCouponMapping) => referalCouponMapping.coupon)
  referalCouponMapping: ReferalCouponMapping[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isActive: Boolean;

  @Column({ default: true })
  displayStatus: Boolean;

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

  @Index()
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

//Pharma Coupon Rules starts
@Entity()
export class CouponPharmaRules extends BaseEntity {
  @OneToMany((type) => Coupon, (coupon) => coupon.couponPharmaRule)
  coupon: Coupon[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column()
  couponCategoryApplicable: CouponCategoryApplicable;

  @Column()
  discountApplicableOn: PharmaDiscountApplicableOn;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  messageOnCouponScreen: string;

  @Column({ type: 'text', nullable: true })
  successMessage: string;

  @Column({ default: false })
  isActive: Boolean;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Pharma Coupon Rules ends

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
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true, type: 'text' })
  patientId: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  medicationHistory: string;

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

  @Column({ default: true })
  isActive: Boolean;

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

  @Index()
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientAddressId: string;

  @Column()
  city: string;

  @Column({ default: BOOKING_SOURCE.MOBILE })
  bookingSource: BOOKING_SOURCE;

  @Column({ default: null })
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

  @Index('DiagnosticOrders_orderStatus')
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

  @Index('DiagnosticOrderLineItems_diagnosticOrderId')
  @ManyToOne(
    (type) => DiagnosticOrders,
    (diagnosticOrders) => diagnosticOrders.diagnosticOrderLineItems
  )
  diagnosticOrders: DiagnosticOrders;

  @Index('DiagnosticOrderLineItems_diagnosticsId')
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

  @Index('DiagnosticPincodeHubs_route')
  @Column({ nullable: true })
  route: string;

  @Column({ nullable: true })
  city: string;

  @Index('DiagnosticPincodeHubs_pincode')
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

  @Column({ nullable: true })
  email: string;

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

@Entity()
export class MedicineOrderShipments extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  apOrderNo: string;

  @Column({ nullable: true })
  siteId: string;

  @Column({ nullable: true })
  siteName: string;

  @Column({ nullable: true })
  trackingNo: string;

  @Column({ nullable: true })
  trackingUrl: string;

  @Column({ nullable: true })
  trackingProvider: string;

  @Column({ nullable: true })
  cancelReasonCode: string;

  @Column({ nullable: true })
  currentStatus: MEDICINE_ORDER_STATUS;

  @Column({ nullable: true })
  updatedDate: Date;

  @Column({ nullable: true, type: 'json' })
  itemDetails: string;

  @OneToMany(
    (type) => MedicineOrdersStatus,
    (medicineOrdersStatus) => medicineOrdersStatus.medicineOrderShipments
  )
  medicineOrdersStatus: MedicineOrdersStatus[];

  @OneToMany(
    (type) => MedicineOrderInvoice,
    (medicineOrderInvoice) => medicineOrderInvoice.medicineOrderShipments
  )
  medicineOrderInvoice: MedicineOrderInvoice[];

  @Index('MedicineOrderShipments_medicineOrderId')
  @ManyToOne((type) => MedicineOrders, (medicineOrders) => medicineOrders.medicineOrderShipments)
  medicineOrders: MedicineOrders;

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
export class MedicineOrderCancelReason extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('MedicineOrderCancelReason_reasonCode')
  @Column({ nullable: true })
  reasonCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  displayMessage: string;

  @Column({ nullable: true })
  isUserReason: boolean;
}

@Entity()
export class PharmacologistConsult extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  prescriptionImageUrl: string;

  @Column({ nullable: true })
  emailId: string;

  @Column({ nullable: true })
  queries: string;

  @ManyToOne((type) => Patient, (patient) => patient.pharmacologistConsult)
  patient: Patient;
}
