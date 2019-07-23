import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';

import { Gender } from 'profiles-service/entity/patient';
import { DoctorSpeciality } from 'doctors-service/entity/doctorSpeciality';
export enum DoctorType {
  STAR = 'STAR',
  APOLLO = 'APOLLO',
  PAYROLL = 'PAYROLL',
}

@Entity()
export class Doctor extends BaseEntity {
  @Column({ nullable: true, type: 'text' })
  awards: String;

  @Column({ nullable: true })
  city: String;

  @Column({ nullable: true })
  country: String;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  deligateNumber: String;

  @Column()
  doctorType: DoctorType;

  @Column({ nullable: true, type: 'text' })
  emailAddress: String;

  @Column({ nullable: true })
  experience: Number;

  @Column()
  firstName: String;

  @Column({ nullable: true })
  gender: Gender;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column({ default: true })
  isActive: Boolean;

  @Column({ nullable: true, type: 'text' })
  languages: String;

  @Column()
  lastName: String;

  @Column()
  mobileNumber: String;

  @Column({ type: 'float8' })
  onlineConsultationFees: Number;

  @Column({ type: 'float8' })
  physicalConsultationFees: Number;

  @Column({ nullable: true, type: 'text' })
  photoURL: String;

  @Column({ nullable: true, type: 'text' })
  qualification: String;

  @Column({ nullable: true })
  salutation: String;

  @Column()
  registrationNumber: String;

  @ManyToOne((type) => DoctorSpeciality, (speciality) => speciality.name)
  speciality: DoctorSpeciality;

  @Column({ nullable: true, type: 'text' })
  specialization: String;

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

  @Column({ nullable: true })
  zip: String;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
