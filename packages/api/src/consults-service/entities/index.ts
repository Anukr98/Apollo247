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
  FOLLOW_UP = 'FOLLOW_UP',
  TRANSFER = 'TRANSFER',
  RESCHEDULE = 'RESCHEDULE',
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

export enum REQUEST_ROLES {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

//Appointment starts
@Entity()
export class Appointment extends BaseEntity {
  @Column({ type: 'timestamp' })
  @IsDate()
  appointmentDateTime: Date;

  @Column()
  appointmentType: APPOINTMENT_TYPE;

  @Column({ nullable: true })
  appointmentState: APPOINTMENT_STATE;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  @OneToMany((type) => CaseSheet, (caseSheet) => caseSheet.appointment)
  caseSheet: CaseSheet[];

  @Column({ generated: 'increment' })
  displayId: number;

  @Column()
  doctorId: string;

  @Column({ nullable: true })
  hospitalId: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ nullable: true })
  parentId: string;

  @Column()
  status: STATUS;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
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

//MedicinePrescription starts
@Entity()
export class MedicinePrescription extends BaseEntity {
  @ManyToOne((type) => CaseSheet, (caseSheet) => caseSheet.medicinePrescription)
  caseSheet: CaseSheet;

  @Column({ nullable: true })
  consumptionDurationInDays: number;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  externalId: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column()
  name: string;

  @Column()
  dosage: string;

  @Column()
  medicineTimings: MEDICINE_TIMINGS;

  @Column()
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN;

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
//MedicinePrescription ends

//case sheet starts
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

  @Column({ nullable: true, type: 'json' })
  diagnosis: string;

  @Column({ nullable: true, type: 'json' })
  diagnosisPrescription: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true })
  followUp: Boolean;

  @Column({ nullable: true })
  followUpAfterInDays: number;

  @Column({ nullable: true })
  followUpDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    (type) => MedicinePrescription,
    (medicinePrescription) => medicinePrescription.caseSheet
  )
  medicinePrescription: MedicinePrescription[];

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
