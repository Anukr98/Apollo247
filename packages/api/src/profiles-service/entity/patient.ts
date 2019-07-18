import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { Validate, IsDate, IsOptional } from 'class-validator';
import { NameValidator, MobileNumberValidator, EmailValidator } from 'validators/entityValidators';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum Relation {
  ME = 'ME',
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  SISTER = 'SISTER',
  BROTHER = 'BROTHER',
  COUSIN = 'COUSIN',
  WIFE = 'WIFE',
  HUSBAND = 'HUSBAND',
  OTHER = 'OTHER',
}

@Entity()
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firebaseUid: string;

  @Column()
  @Validate(NameValidator)
  firstName: string;

  @Column()
  @Validate(NameValidator)
  lastName: string;

  @Column({ nullable: true })
  gender: Gender;

  @Column()
  @Validate(MobileNumberValidator)
  mobileNumber: string;

  @Column({ nullable: true })
  uhid: string;

  @Column({ nullable: true })
  @IsOptional()
  @Validate(EmailValidator)
  emailAddress: string;

  @Column({ nullable: true })
  relation: Relation;

  @Column({ nullable: true })
  @IsDate()
  dateOfBirth: Date;
}
