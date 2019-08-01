import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Gender } from 'profiles-service/entity/patient';
import { DoctorSpecialty } from 'doctors-service/entities/doctorSpecialty';
import { Validate, IsDate } from 'class-validator';
import { NameValidator, MobileNumberValidator, EmailValidator } from 'validators/entityValidators';
import { StarTeam, DoctorAndHospital, ConsultHours } from 'doctors-service/entities';
export enum DoctorType {
  APOLLO = 'APOLLO',
  PAYROLL = 'PAYROLL',
  STAR_APOLLO = 'STAR_APOLLO',
}

export enum Salutation {
  MR = 'MR',
  MRS = 'MRS',
  DR = 'DR',
}

@Entity()
export class Doctor extends BaseEntity {
  @Column({ nullable: true, type: 'text' })
  awards: String;

  @Column({ nullable: true })
  city: String;

  @OneToMany((type) => ConsultHours, (consultHours) => consultHours.doctor)
  consultHours: ConsultHours[];

  @Column({ nullable: true })
  country: String;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  @IsDate()
  dateOfBirth: Date;

  @OneToMany((type) => DoctorAndHospital, (doctorHospital) => doctorHospital.doctor)
  doctorHospital: DoctorAndHospital[];

  @Column()
  doctorType: DoctorType;

  @Column({ nullable: true })
  delegateNumber: String;

  @Column({ nullable: true, type: 'text' })
  @Validate(EmailValidator)
  emailAddress: String;

  @Column({ nullable: true })
  experience: Number;

  @Column()
  @Validate(NameValidator)
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
  @Validate(NameValidator)
  lastName: String;

  @Column()
  @Validate(MobileNumberValidator)
  mobileNumber: String;

  @Column({ type: 'float8' })
  onlineConsultationFees: Number;

  @Column({ nullable: true, type: 'text' })
  photoUrl: String;

  @Column({ type: 'float8' })
  physicalConsultationFees: Number;

  @Column({ nullable: true, type: 'text' })
  qualification: String;

  @Column()
  registrationNumber: String;

  @Column({ nullable: true })
  salutation: Salutation;

  @ManyToOne((type) => DoctorSpecialty, (specialty) => specialty.doctor)
  specialty: DoctorSpecialty;

  @Column({ nullable: true, type: 'text' })
  specialization: String;

  @OneToMany((type) => StarTeam, (starTeam) => starTeam.starDoctor)
  starTeam: StarTeam[];

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
