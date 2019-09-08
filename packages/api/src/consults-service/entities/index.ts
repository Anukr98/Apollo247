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
}

export enum STATUS {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
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

  @Column({ nullable: true })
  cancelledBy: TRANSFER_INITIATED_TYPE;

  @Column({ nullable: true })
  cancelledById: string;

  @OneToMany((type) => CaseSheet, (caseSheet) => caseSheet.appointment)
  caseSheet: CaseSheet[];

  @Column({ generated: 'increment' })
  displayId: number;

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

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ default: 0 })
  rescheduleCount: number;

  @Column()
  status: STATUS;

  @Column({ nullable: true })
  updatedDate: Date;

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
}
//Appointment ends

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
export type CaseSheetMedicinePrescription = {
  id: string;
  externalId: string;
  medicineConsumptionDurationInDays: number;
  medicineDosage: string;
  medicineInstructions?: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineName: string;
};
export type CaseSheetDiagnosis = { name: string };
export type CaseSheetDiagnosisPrescription = { name: string };
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
  generalAdvice: {
    title: string;
    description: string[];
  }[];
  diagnoses: {
    title: string;
    description: string;
  }[];
  doctorInfo: {
    salutation: string;
    firstName: string;
    lastName: string;
    qualifications: string;
    registrationNumber: string;
  };
}
///////////////////////////////////////////////////////////
