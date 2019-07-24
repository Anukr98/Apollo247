import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import { Validate } from 'class-validator';
import { NameValidator } from 'validators/entityValidators';

export enum FacilityType {
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
}

@Entity()
export class Facility extends BaseEntity {
  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  city: String;

  @Column({ nullable: true })
  country: String;

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
