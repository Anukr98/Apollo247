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
}

export enum UPLOAD_FILE_TYPES {
  JPG = 'JPG',
  PNG = 'PNG',
  JPEG = 'JPEG',
  PDF = 'PDF',
}

export enum MEDICINE_DELIVERY_TYPE {
  HOME_DELIVERY = 'HOME_DELIVERY',
  STORE_PICK_UP = 'STORE_PICK_UP',
}

export enum MEDICINE_ORDER_TYPE {
  UPLOAD_PRESCRIPTION = 'UPLOAD_PRESCRIPTION',
  CART_ORDER = 'CART_ORDER',
}

export enum MEDICINE_ORDER_PAYMENT_TYPE {
  COD = 'COD',
  ONLINE = 'ONLINE',
  NO_PAYMENT = 'NO_PAYMENT',
}

export enum DEVICE_TYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

//medicine orders starts
@Entity()
export class MedicineOrders extends BaseEntity {
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

  @Column('decimal', { precision: 5, scale: 2 })
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

  @Column('decimal', { precision: 5, scale: 2 })
  mrp: number;

  @Column({ nullable: true })
  prescriptionImageUrl: string;

  @Column('decimal', { precision: 5, scale: 2 })
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
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
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

  @Column()
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

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @Column({ nullable: true })
  uhid: string;

  @Column({ nullable: true })
  relation: Relation;

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
  city: string;

  @Column({ nullable: true })
  mobileNumber: string;

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
