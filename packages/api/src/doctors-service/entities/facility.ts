import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';

import { Validate } from 'class-validator';
import { NameValidator } from 'validators/entityValidators';
import { DoctorAndHospital } from 'doctors-service/entities/doctorAndHospital';
import { ConsultHours } from 'doctors-service/entities/consultHours';

export enum FacilityType {
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
}

@Entity()
export class Facility extends BaseEntity {
  @Column({ nullable: true })
  city: String;

  @OneToMany((type) => ConsultHours, (consultHours) => consultHours.facility)
  consultHours: ConsultHours[];

  @Column({ nullable: true })
  country: String;

  @Column()
  createdDate: Date;

  @OneToMany((type) => DoctorAndHospital, (doctorHospital) => doctorHospital.doctor)
  doctorHospital: DoctorAndHospital[];

  @Column()
  facilityType: FacilityType;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column({ nullable: true })
  latitude: String;

  @Column({ nullable: true })
  longitude: String;

  @Column()
  @Validate(NameValidator)
  name: String;

  @Column({ nullable: true })
  state: String;

  @Column({ nullable: true, type: 'text' })
  streetLine1: String;

  @Column({ nullable: true, type: 'text' })
  streetLine2: String;

  @Column({ nullable: true, type: 'text' })
  streetLine3: String;

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
