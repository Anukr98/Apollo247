import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
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
  ORDERED = 'ORDERED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  ON_THE_WAY = 'ON_THE_WAY',
  PICKEDUP = 'PICKEDUP',
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
}

export enum DEVICE_TYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

//medicine orders starts
@Entity()
export class MedicineOrders extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column()
  deliveryType: MEDICINE_DELIVERY_TYPE;

  @Column('decimal', { precision: 5, scale: 2 })
  estimatedAmount: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderType: MEDICINE_ORDER_TYPE;

  @Column({ nullable: true, type: 'timestamp' })
  orderDateTime: Date;

  @Column({ type: 'timestamp' })
  quoteDateTime: Date;

  @Column()
  quoteId: string;

  @Column({ nullable: true })
  shopId: string;

  @Column()
  status: MEDICINE_ORDER_STATUS;

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
}
//medicine orders ends

//medicine orders  line items start
@Entity()
export class MedicineOrderLineItems extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicineSKU: string;

  @Column()
  medicineName: string;

  @Column('decimal', { precision: 5, scale: 2 })
  mrp: number;

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
  @Column('decimal', { precision: 5, scale: 2 })
  amountPaid: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;

  @Column()
  paymentRefId: string;

  @Column()
  paymentDateTime: Date;

  @Column()
  paymentStatus: String;

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
//medicine orders payments ends

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
  @OneToMany((type) => PatientDeviceTokens, (patientDeviceTokens) => patientDeviceTokens.patient)
  patientDeviceTokens: PatientDeviceTokens[];

  @OneToMany((type) => MedicineOrders, (medicineOrders) => medicineOrders.patient)
  medicineOrders: MedicineOrders[];

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

  @Column()
  @Validate(MobileNumberValidator)
  mobileNumber: string;

  @Column({ nullable: true, type: 'text' })
  allergies: string;

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @Column({ nullable: true })
  uhid: string;

  @Column({ nullable: true })
  relation: Relation;

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

  @OneToMany((type) => SearchHistory, (searchHistory) => searchHistory.patient)
  searchHistory: SearchHistory[];

  @OneToMany((type) => PatientAddress, (patientAddress) => patientAddress.patient)
  patientAddress: PatientAddress[];
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
