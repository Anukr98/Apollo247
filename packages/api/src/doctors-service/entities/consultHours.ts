import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import { DoctorAndHospital, Doctor, Facility } from 'doctors-service/entities';

export enum WeekDay {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export enum ConsultType {
  SUNDAY = 'FIXED',
  MONDAY = 'PREFERRED',
}

export enum ConsultMode {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
}

@Entity()
export class ConsultHours extends BaseEntity {
  @Column()
  consultMode: ConsultMode;

  @Column()
  consultType: ConsultType;

  @Column()
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.consultHours)
  doctor: Doctor;

  @ManyToOne((type) => DoctorAndHospital, (doctorHospital) => doctorHospital.consultHours)
  doctorHospital: DoctorAndHospital;

  @Column({ type: 'timestamp' })
  endTime: String;

  @ManyToOne((type) => Facility, (facility) => facility.consultHours)
  facility: Facility;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column({ default: true })
  isActive: Boolean;

  @Column({ type: 'timestamp' })
  startTime: String;

  @Column({ nullable: true })
  updatedDate: Date;

  @Column()
  weekDay: WeekDay;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
