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
} from 'typeorm';
import { Validate, IsOptional } from 'class-validator';
import { NameValidator, MobileNumberValidator } from 'validators/entityValidators';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum PATIENT_ADDRESS_TYPE {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
}

export enum Relation {
  ME = 'ME',
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  SISTER = 'SISTER',
  BROTHER = 'BROTHER',
  COUSIN = 'COUSIN',
  WIFE = 'WIFE',
  HUSBAND = 'HUSBAND',
  OTHER = 'OTHER',
}

export enum SEARCH_TYPE {
  DOCTOR = 'DOCTOR',
  SPECIALTY = 'SPECIALTY',
  MEDICINE = 'MEDICINE',
}

export enum MEDICINE_ORDER_STATUS {
  QUOTE = 'QUOTE',
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
}

export enum UPLOAD_FILE_TYPES {
  JPG = 'JPG',
  PNG = 'PNG',
  JPEG = 'JPEG',
  PDF = 'PDF',
}

export enum DIAGNOSTICS_TYPE {
  TEST = 'TEST',
  PACKAGE = 'PACKAGE',
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

export enum DEVICE_TYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export enum PHARMA_CART_TYPE {
  CART = 'CART',
  NONCART = 'NONCART',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

export enum MedicalTestUnit {
  GM = 'GM',
  _PERCENT_ = '_PERCENT_',
  GM_SLASH_DL = 'GM_SLASH_DL',
}

export enum MedicalRecordType {
  EHR = 'EHR',
  PHYSICAL_EXAMINATION = 'PHYSICAL_EXAMINATION',
  OPERATIVE_REPORT = 'OPERATIVE_REPORT',
  PATHOLOGY_REPORT = 'PATHOLOGY_REPORT',
}
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

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedAmount: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryGeneratedColumn({ type: 'bigint' })
  orderAutoId: number;

  @Column()
  orderType: MEDICINE_ORDER_TYPE;

  @Column({ nullable: true, type: 'timestamp' })
  orderDateTime: Date;

  @Column({ nullable: true })
  patientAddressId: string;

  @Column({ nullable: true })
  prescriptionImageUrl: string;

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
  @Column({ nullable: true, type: 'text' })
  allergies: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  @IsOptional()
  emailAddress: string;

  @OneToMany((type) => PatientFamilyHistory, (familyHistory) => familyHistory.patient)
  familyHistory: PatientFamilyHistory[];

  @Column()
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

  @Column()
  lastName: string;

  @OneToMany((type) => PatientLifeStyle, (lifeStyle) => lifeStyle.patient)
  lifeStyle: PatientLifeStyle[];

  @OneToMany((type) => MedicineOrders, (medicineOrders) => medicineOrders.patient)
  medicineOrders: MedicineOrders[];

  @OneToMany((type) => MedicalRecords, (medicalRecords) => medicalRecords.patient)
  medicalRecords: MedicalRecords[];

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

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @Column({ nullable: true })
  uhid: string;

  @Column({ nullable: true })
  relation: Relation;

  @Column({ nullable: true, default: true })
  isActive: Boolean;

  @OneToMany((type) => SearchHistory, (searchHistory) => searchHistory.patient)
  searchHistory: SearchHistory[];

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
//patient Ends

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
  @Column()
  createdDate: Date;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  discountType: DiscountType;

  @Column()
  discount: number;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isActive: Boolean;

  @Column({ nullable: true })
  minimumOrderAmount: number;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Coupon ends

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
