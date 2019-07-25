import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import { DoctorAndHospital } from 'doctors-service/entity/doctorAndHospital';
import { Doctor } from 'doctors-service/entity/doctor';
import { Facility } from 'doctors-service/entity/facility';

export enum WeekDay {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

@Entity()
export class ConsultHours extends BaseEntity {
  @Column()
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.consultHours)
  doctor: Doctor;

  @ManyToOne((type) => DoctorAndHospital, (doctorHospital) => doctorHospital.consultHours)
  doctorHospital: DoctorAndHospital;

  @ManyToOne((type) => Facility, (facility) => facility.consultHours)
  facility: Facility;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column({ default: true })
  isActive: Boolean;

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
