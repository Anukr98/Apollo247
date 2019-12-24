import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeUpdate,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Validate, IsDate } from 'class-validator';
import { NameValidator, MobileNumberValidator, EmailValidator } from 'validators/entityValidators';

export enum AccountType {
  CURRENT,
  SAVINGS,
}

export enum ConsultType {
  FIXED = 'FIXED',
  PREFERRED = 'PREFERRED',
}

export enum ConsultMode {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
  BOTH = 'BOTH',
}

export enum DoctorType {
  APOLLO = 'APOLLO',
  PAYROLL = 'PAYROLL',
  STAR_APOLLO = 'STAR_APOLLO',
  JUNIOR = 'JUNIOR',
}

export enum FacilityType {
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
}

export enum SpecialtySearchType {
  ID = 'ID',
  NAME = 'NAME',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum Salutation {
  MR = 'MR',
  MRS = 'MRS',
  DR = 'DR',
}

export enum WeekDay {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export enum DOCTOR_DEVICE_TYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export enum DOCTOR_ONLINE_STATUS {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
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

export type ConsultHoursData = {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
  consultMode: ConsultMode;
};
///////////////////////////////////////////////////////////
// BlockedCalendarItem
///////////////////////////////////////////////////////////
@Entity()
export class BlockedCalendarItem extends BaseEntity {
  @Column({ nullable: true, default: ConsultMode.BOTH })
  consultMode: ConsultMode;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column()
  doctorId: string;

  @Column({ type: 'timestamp with time zone' })
  end: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @Column({ type: 'timestamp with time zone' })
  start: Date;
}
///////////////////////////////////////////////////////////

//consult Hours starts
@Entity()
export class ConsultHours extends BaseEntity {
  @Column({ nullable: true, default: 15 })
  consultDuration: number;

  @Column({ default: 10 })
  consultBuffer: number;

  @Column()
  consultMode: ConsultMode;

  @Column()
  consultType: ConsultType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.consultHours)
  doctor: Doctor;

  @ManyToOne((type) => DoctorAndHospital, (doctorHospital) => doctorHospital.consultHours)
  doctorHospital: DoctorAndHospital;

  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne((type) => Facility, (facility) => facility.consultHours)
  facility: Facility;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: Boolean;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @Column()
  weekDay: WeekDay;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//consult hours ends

//doctor starts
@Entity()
export class Doctor extends BaseEntity {
  @OneToMany((type) => DoctorBankAccounts, (bankAccount) => bankAccount.doctor)
  bankAccount: DoctorBankAccounts[];

  @Column({ nullable: true, type: 'text' })
  awards: string;

  @Column({ nullable: true })
  city: string;

  @OneToMany((type) => ConsultHours, (consultHours) => consultHours.doctor)
  consultHours: ConsultHours[];

  @OneToMany(
    (type) => DoctorsFavouriteAdvice,
    (doctorFavouriteAdvice) => doctorFavouriteAdvice.doctor
  )
  doctorFavouriteAdvice: DoctorsFavouriteAdvice[];

  @OneToMany(
    (type) => DoctorsFavouriteMedicine,
    (doctorFavouriteMedicine) => doctorFavouriteMedicine.doctor
  )
  doctorFavouriteMedicine: DoctorsFavouriteMedicine[];

  @OneToMany((type) => DoctorsFavouriteTests, (doctorFavouriteTest) => doctorFavouriteTest.doctor)
  doctorFavouriteTest: DoctorsFavouriteTests[];

  @OneToMany((type) => DoctorDeviceTokens, (doctorDeviceTokens) => doctorDeviceTokens.doctor)
  doctorDeviceTokens: DoctorDeviceTokens[];

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  @IsDate()
  dateOfBirth: Date;

  @Column({ nullable: true })
  displayName: string;

  @OneToMany((type) => DoctorAndHospital, (doctorHospital) => doctorHospital.doctor)
  doctorHospital: DoctorAndHospital[];

  @OneToOne((type) => DoctorSecretary, (doctorSecretary) => doctorSecretary.doctor)
  doctorSecretary: DoctorSecretary;

  @Column()
  doctorType: DoctorType;

  @Column({ nullable: true })
  delegateName: string;

  @Column({ nullable: true })
  delegateNumber: string;

  @Column({ nullable: true, type: 'text' })
  @Validate(EmailValidator)
  emailAddress: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  experience: Number;

  @Column()
  @Validate(NameValidator)
  firstName: string;

  @Column({ nullable: true })
  firebaseToken: string;

  @Column({ nullable: true })
  gender: Gender;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: Boolean;

  @Column({ nullable: true, type: 'text' })
  languages: string;

  @Column()
  @Validate(NameValidator)
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  @Validate(MobileNumberValidator)
  mobileNumber: string;

  @Column({ nullable: true, type: 'timestamp' })
  nextAvailableSlot: Date;

  @Column({ type: 'float8' })
  onlineConsultationFees: Number;

  @Column({ default: DOCTOR_ONLINE_STATUS.AWAY })
  onlineStatus: DOCTOR_ONLINE_STATUS;

  @OneToMany((type) => Packages, (packages) => packages.doctor)
  packages: Packages[];

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @Column({ type: 'float8' })
  physicalConsultationFees: Number;

  @Column({ nullable: true, type: 'text' })
  qualification: string;

  @Column()
  registrationNumber: string;

  @Column({ nullable: true })
  salutation: Salutation;

  @Column({ nullable: true, type: 'text' })
  signature: string;

  @ManyToOne((type) => DoctorSpecialty, (specialty) => specialty.doctor)
  specialty: DoctorSpecialty;

  @Column({ nullable: true, type: 'text' })
  specialization: string;

  @OneToMany((type) => StarTeam, (starTeam) => starTeam.starDoctor)
  starTeam: StarTeam[];

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true, type: 'text' })
  streetLine1: string;

  @Column({ nullable: true, type: 'text' })
  streetLine2: string;

  @Column({ nullable: true, type: 'text' })
  streetLine3: string;

  @Column({ nullable: true, type: 'text' })
  thumbnailUrl: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @Column({ nullable: true })
  zip: string;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctor ends

//doctorHospital starts
@Entity()
export class DoctorAndHospital extends BaseEntity {
  @OneToMany((type) => ConsultHours, (consultHours) => consultHours.doctorHospital)
  consultHours: ConsultHours[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.doctorHospital)
  doctor: Doctor;

  @ManyToOne((type) => Facility, (facility) => facility.doctorHospital)
  facility: Facility;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctorHospital ends

//doctorBankAccount starts
@Entity()
export class DoctorBankAccounts extends BaseEntity {
  @Column()
  accountHolderName: string;

  @Column()
  accountNumber: string;

  @Column({ type: String })
  accountType: AccountType;

  @Column()
  bankName: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.bankAccount)
  doctor: Doctor;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  IFSCcode: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true, type: 'text' })
  streetLine1: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctorBankAccount ends

//doctorSpecialty starts
@Entity()
export class DoctorSpecialty extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  displayOrder: Number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  image: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  specialistSingularTerm: string;

  @Column({ nullable: true })
  specialistPluralTerm: string;

  @Column({ nullable: true, type: 'text' })
  userFriendlyNomenclature: string;

  @Column({ nullable: true })
  updatedDate: Date;
  @OneToMany((type) => Doctor, (doctor) => doctor.specialty)
  doctor: Doctor[];

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctorSpecialty ends

//facility starts
@Entity()
export class Facility extends BaseEntity {
  @Column({ nullable: true })
  city: string;

  @OneToMany((type) => ConsultHours, (consultHours) => consultHours.facility)
  consultHours: ConsultHours[];

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @OneToMany((type) => DoctorAndHospital, (doctorHospital) => doctorHospital.doctor)
  doctorHospital: DoctorAndHospital[];

  @Column()
  facilityType: FacilityType;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  imageUrl: string;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @Column()
  @Validate(NameValidator)
  name: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true, type: 'text' })
  streetLine1: string;

  @Column({ nullable: true, type: 'text' })
  streetLine2: string;

  @Column({ nullable: true, type: 'text' })
  streetLine3: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @Column({ nullable: true })
  zipcode: string;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//facility ends

//packages starts
@Entity()
export class Packages extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.packages)
  doctor: Doctor;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float8' })
  fees: Number;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//packages ends

//starTeam starts
@Entity()
export class StarTeam extends BaseEntity {
  @OneToOne((type) => Doctor)
  @JoinColumn()
  associatedDoctor: Doctor;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isActive: Boolean;

  @ManyToOne((type) => Doctor, (doctor) => doctor.starTeam)
  starDoctor: Doctor;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//startteam Ends

//doctor device tokens starts
@Entity()
export class DoctorDeviceTokens extends BaseEntity {
  @ManyToOne((type) => Doctor, (doctor) => doctor.doctorDeviceTokens)
  doctor: Doctor;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'text' })
  deviceToken: string;

  @Column()
  deviceOS: string;

  @Column()
  deviceType: DOCTOR_DEVICE_TYPE;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctor device token ends

//admin user starts
export enum AdminType {
  ADMIN = 'ADMIN',
  JDADMIN = 'JDADMIN',
}
@Entity()
export class AdminUsers extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: Boolean;

  @Column()
  @Validate(MobileNumberValidator)
  mobileNumber: string;

  @Column()
  userType: AdminType;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//admin user ends

//secretary starts
@Entity()
export class Secretary extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @OneToMany((type) => DoctorSecretary, (doctorSecretary) => doctorSecretary.secretary)
  doctorSecretary: DoctorSecretary[];

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Validate(NameValidator)
  name: string;

  @Column()
  @Validate(MobileNumberValidator)
  mobileNumber: string;

  @Column({ default: true })
  isActive: Boolean;
  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//secretary ends

//doctor secretary starts
@Entity()
export class DoctorSecretary extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @OneToOne((type) => Doctor)
  @JoinColumn()
  doctor: Doctor;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: Boolean;

  @ManyToOne((type) => Secretary, (secretary) => secretary.doctorSecretary)
  secretary: Secretary;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctor secretary ends

//DoctorFavouriteMedicine starts
@Entity()
export class DoctorsFavouriteMedicine extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.doctorFavouriteMedicine)
  doctor: Doctor;

  @Column({ nullable: true })
  externalId: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  medicineConsumptionDurationInDays: Number;

  @Column({ nullable: true })
  medicineDosage: string;

  @Column({ nullable: true })
  medicineUnit: string;

  @Column({ nullable: true })
  medicineInstructions: string;

  @Column('simple-array')
  medicineTimings: MEDICINE_TIMINGS[];

  @Column('simple-array')
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];

  @Column({ nullable: true })
  medicineName: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
// DoctorFavouriteMedicine ends

//doctors favoutite tests starts
@Entity()
export class DoctorsFavouriteTests extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.doctorFavouriteTest)
  doctor: Doctor;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemname: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctors favoutite tests ends

//doctors favoutite advice starts
@Entity()
export class DoctorsFavouriteAdvice extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.doctorFavouriteAdvice)
  doctor: Doctor;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//doctors favoutite advice ends
