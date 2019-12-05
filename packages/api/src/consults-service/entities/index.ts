import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { IsDate } from 'class-validator';
import { DoctorType } from 'doctors-service/entities';

export enum patientLogSort {
  MOST_RECENT = 'MOST_RECENT',
  NUMBER_OF_CONSULTS = 'NUMBER_OF_CONSULTS',
  PATIENT_NAME_A_TO_Z = 'PATIENT_NAME_A_TO_Z',
  PATIENT_NAME_Z_TO_A = 'PATIENT_NAME_Z_TO_A',
}

export enum patientLogType {
  ALL = 'ALL',
  FOLLOW_UP = 'FOLLOW_UP',
  REGULAR = 'REGULAR',
}

export enum APPOINTMENT_TYPE {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
  BOTH = 'BOTH',
}

export enum STATUS {
  PENDING = 'PENDING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  JUNIOR_DOCTOR_STARTED = 'JUNIOR_DOCTOR_STARTED',
  JUNIOR_DOCTOR_ENDED = 'JUNIOR_DOCTOR_ENDED',
  CALL_ABANDON = 'CALL_ABANDON',
}

export enum APPOINTMENT_STATE {
  NEW = 'NEW',
  TRANSFER = 'TRANSFER',
  RESCHEDULE = 'RESCHEDULE',
  TRANSFERRED = 'TRANSFERRED',
  AWAITING_TRANSFER = 'AWAITING_TRANSFER',
  AWAITING_RESCHEDULE = 'AWAITING_RESCHEDULE',
}

export enum REQUEST_ROLES {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  JUNIOR = 'JUNIOR',
}

export enum TRANSFER_STATUS {
  INITIATED = 'INITIATED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum TRANSFER_INITIATED_TYPE {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export enum APPOINTMENT_PAYMENT_TYPE {
  ONLINE = 'ONLINE',
}

export enum CONSULTS_RX_SEARCH_FILTER {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
  PRESCRIPTION = 'PRESCRIPTION',
}

export enum BOOKINGSOURCE {
  MOBILE = 'MOBILE',
  WEB = 'WEB',
}

export enum DEVICETYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

//Appointment starts
@Entity()
export class Appointment extends BaseEntity {
  @Column({ nullable: true, default: 0 })
  apolloAppointmentId: number;

  @Column({ type: 'timestamp' })
  @IsDate()
  appointmentDateTime: Date;

  @Column()
  appointmentType: APPOINTMENT_TYPE;

  @Column({ nullable: true })
  appointmentState: APPOINTMENT_STATE;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  cancelledDate: Date;

  @Column({ nullable: true })
  cancelledBy: REQUEST_ROLES;

  @Column({ nullable: true })
  cancelledById: string;

  @OneToMany((type) => CaseSheet, (caseSheet) => caseSheet.appointment)
  caseSheet: CaseSheet[];

  @Column({ generated: 'increment' })
  displayId: number;

  @Column({ nullable: true })
  doctorCancelReason: string;

  @Column()
  doctorId: string;

  @Column({ nullable: true })
  followUpParentId: string;

  @Column({ nullable: true })
  hospitalId: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: false })
  isFollowUp: Boolean;

  @Column({ nullable: true, default: false })
  isFollowPaid: Boolean;

  @Column({ nullable: true, default: false })
  isJdQuestionsComplete: Boolean;

  @Column({ nullable: true, default: false })
  isTransfer: Boolean;

  @Column({ nullable: true, default: false })
  isConsultStarted: Boolean;

  @Column({ nullable: true })
  patientCancelReason: string;

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ default: 0 })
  rescheduleCount: number;

  @Column({ default: 0 })
  rescheduleCountByDoctor: number;

  @Column()
  status: STATUS;

  @Column({ nullable: true })
  transferParentId: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @Column({ nullable: true, type: 'text' })
  symptoms: string;

  @Column({ default: BOOKINGSOURCE.MOBILE })
  bookingSource: BOOKINGSOURCE;

  @Column({ nullable: true })
  deviceType: DEVICETYPE;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @OneToMany(
    (type) => TransferAppointmentDetails,
    (transferAppointmentDetails) => transferAppointmentDetails.appointment
  )
  transferAppointmentDetails: TransferAppointmentDetails[];

  @OneToMany(
    (type) => RescheduleAppointmentDetails,
    (rescheduleAppointmentDetails) => rescheduleAppointmentDetails.appointment
  )
  rescheduleAppointmentDetails: RescheduleAppointmentDetails[];

  @OneToMany(
    (type) => AppointmentPayments,
    (appointmentPayments) => appointmentPayments.appointment
  )
  appointmentPayments: AppointmentPayments[];

  @OneToMany((type) => AppointmentNoShow, (appointmentNoShow) => appointmentNoShow.appointment)
  appointmentNoShow: AppointmentNoShow[];

  @OneToMany(
    (type) => AppointmentDocuments,
    (appointmentDocuments) => appointmentDocuments.appointment
  )
  appointmentDocuments: AppointmentDocuments[];
}
//Appointment ends

//AppointmentDocuments starts
@Entity()
export class AppointmentDocuments extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  documentPath: string;

  @Column({ nullable: true })
  prismFileId: string;

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentDocuments)
  appointment: Appointment;
}
//AppointmentDocuments ends

//AppointmentPayments starts
@Entity()
export class AppointmentPayments extends BaseEntity {
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  amountPaid: number;

  @Column({ nullable: true })
  bankTxnId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true, type: 'timestamp' })
  paymentDateTime: Date;

  @Column({ nullable: true })
  paymentRefId: string;

  @Column()
  paymentStatus: string;

  @Column()
  paymentType: APPOINTMENT_PAYMENT_TYPE;

  @Column({ nullable: true, type: 'text' })
  responseCode: string;

  @Column({ type: 'text' })
  responseMessage: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentPayments)
  appointment: Appointment;
}
//AppointmentPayments ends

//AppointmentSessions starts
@Entity()
export class AppointmentSessions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne((type) => Appointment)
  @JoinColumn()
  appointment: Appointment;

  @Column({ type: 'timestamp', nullable: true })
  consultStartDateTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  consultEndDateTime: Date;

  @Column()
  sessionId: string;

  @Column()
  doctorToken: string;

  @Column({ nullable: true })
  patientToken: string;

  @Column()
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
//AppointmentSessions ends

//Appointment call details start

//Appointment call details end
@Entity()
export class AppointmentCallDetails extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  callType: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true })
  doctorName: string;

  @Column()
  doctorType: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentPayments)
  appointment: Appointment;

  @Column()
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

//Junior AppointmentSessions starts
@Entity()
export class JuniorAppointmentSessions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne((type) => Appointment)
  @JoinColumn()
  appointment: Appointment;

  @Column({ type: 'timestamp', nullable: true })
  consultStartDateTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  consultEndDateTime: Date;

  @Column()
  sessionId: string;

  @Column()
  juniorDoctorToken: string;

  @Column({ nullable: true })
  patientToken: string;

  @Column()
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
//Junior AppointmentSessions ends

//case sheet starts
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

export enum CASESHEET_STATUS {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum MEDICINE_UNIT {
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  ML = 'ML',
  DROPS = 'DROPS',
  NA = 'NA',
}

export type CaseSheetMedicinePrescription = {
  id: string;
  externalId: string;
  medicineConsumptionDurationInDays: number;
  medicineDosage: string;
  medicineUnit: string;
  medicineInstructions?: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineName: string;
};
export type CaseSheetDiagnosis = { name: string };
export type CaseSheetDiagnosisPrescription = { itemname: string };
export type CaseSheetOtherInstruction = { instruction: string };
export type CaseSheetSymptom = {
  symptom: string;
  since: string;
  howOften: string;
  severity: string;
};

@Entity()
export class CaseSheet extends BaseEntity {
  @ManyToOne((type) => Appointment, (appointment) => appointment.caseSheet)
  appointment: Appointment;

  @Column({ nullable: true, type: 'text' })
  blobName: string;

  @Column({ nullable: true, type: 'text' })
  prismFileId: string;

  @Column()
  consultType: APPOINTMENT_TYPE;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  createdDoctorId: string;

  @Column({ default: DoctorType.JUNIOR })
  doctorType: DoctorType;

  @Column({ nullable: true, type: 'json' })
  diagnosis: string;

  @Column({ nullable: true, type: 'json' })
  diagnosticPrescription: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true, default: false })
  followUp: Boolean;

  @Column({ nullable: true })
  followUpAfterInDays: number;

  @Column({ nullable: true })
  followUpDate: Date;

  @Column({ nullable: true })
  followUpConsultType: APPOINTMENT_TYPE;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'json' })
  medicinePrescription: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'json' })
  otherInstructions: string;

  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true, default: false })
  sentToPatient: boolean;

  @Column({ nullable: true, default: CASESHEET_STATUS.PENDING })
  status: CASESHEET_STATUS;

  @Column({ nullable: true, type: 'json' })
  symptoms: string;

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
//case sheet ends

///////////////////////////////////////////////////////////
// ConsultQueueItem
///////////////////////////////////////////////////////////
@Entity()
export class ConsultQueueItem extends BaseEntity {
  @Column()
  appointmentId: string;

  @Column()
  createdDate: Date;

  @Column()
  doctorId: string;

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isActive: boolean;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }
}
///////////////////////////////////////////////////////////

//transfer-appointment starts
@Entity()
export class TransferAppointmentDetails extends BaseEntity {
  @ManyToOne((type) => Appointment, (appointment) => appointment.transferAppointmentDetails)
  appointment: Appointment;

  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  transferReason: string;

  @Column({ nullable: true })
  transferredDoctorId: string;

  @Column()
  transferInitiatedBy: TRANSFER_INITIATED_TYPE;

  @Column({ nullable: true })
  transferInitiatedId: string;

  @Column({ nullable: true })
  transferredSpecialtyId: string;

  @Column({ nullable: true, type: 'text' })
  transferNotes: string;

  @Column()
  transferStatus: TRANSFER_STATUS;

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
//transfer apppointment ends

//Reschedule-appointment starts
@Entity()
export class RescheduleAppointmentDetails extends BaseEntity {
  @ManyToOne((type) => Appointment, (appointment) => appointment.rescheduleAppointmentDetails)
  appointment: Appointment;

  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  rescheduledDateTime: Date;

  @Column({ type: 'text' })
  rescheduleReason: string;

  @Column()
  rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE;

  @Column({ nullable: true })
  rescheduleInitiatedId: string;

  @Column()
  rescheduleStatus: TRANSFER_STATUS;

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
//Reschedule apppointment ends

//DoctorNextAvaialbleSlots starts
@Entity()
export class DoctorNextAvaialbleSlots extends BaseEntity {
  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true, type: 'timestamp' })
  physicalSlot: Date;

  @Column({ nullable: true, type: 'timestamp' })
  onlineSlot: Date;

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
//DoctorNextAvaialbleSlots ends

//Appointment no show details start
@Entity()
export class AppointmentNoShow extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  noShowType: REQUEST_ROLES;

  @Column({ default: STATUS.NO_SHOW })
  noShowStatus: STATUS;

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentNoShow)
  appointment: Appointment;

  @Column()
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
//Appointment no show details end

///////////////////////////////////////////////////////////
// RxPdf
///////////////////////////////////////////////////////////
export interface RxPdfData {
  prescriptions: {
    name: string;
    ingredients: string[];
    frequency: string;
    instructions?: string;
  }[];
  generalAdvice: CaseSheetOtherInstruction[];
  diagnoses: CaseSheetDiagnosis[];
  doctorInfo: {
    salutation: string;
    firstName: string;
    lastName: string;
    qualifications: string;
    registrationNumber: string;
    specialty: string;
  };
  hospitalAddress: {
    name: string;
    streetLine1: string;
    streetLine2: string;
    city: string;
    zipcode: string;
    state: string;
    country: string;
  };
  patientInfo: {
    firstName: string;
    lastName: string;
    gender: string;
    uhid: string;
    age: string;
  };
  vitals: { height: string; weight: string; temperature: string; bp: string };
  appointmentDetails: { displayId: string; consultDate: string; consultType: string };
  diagnosesTests: CaseSheetDiagnosisPrescription[];
  caseSheetSymptoms: CaseSheetSymptom[];
  followUpDetails: string;
}
///////////////////////////////////////////////////////////
