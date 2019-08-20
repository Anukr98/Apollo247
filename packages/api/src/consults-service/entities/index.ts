import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { IsDate } from 'class-validator';

export enum STATUS {
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  FOLLOW_UP = 'FOLLOW_UP',
  TRANSFER = 'TRANSFER',
  RESCHEDULE = 'RESCHEDULE',
}

export enum APPOINTMENT_TYPE {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
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

  @Column({ generated: 'increment' })
  appointmentId: number;

  @Column()
  appointmentType: APPOINTMENT_TYPE;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

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
  tabletCount: number;

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
