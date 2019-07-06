import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

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

export enum ErrorMsgs {
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_MOBILE_NUMBER = 'INVALID_MOBILE_NUMBER',
  PRISM_AUTH_TOKEN_ERROR = 'PRISM_AUTH_TOKEN_ERROR',
  PRISM_GET_USERS_ERROR = 'PRISM_GET_USERS_ERROR',
  UPDATE_PROFILE_ERROR = 'UPDATE_PROFILE_ERROR',
  PRISM_NO_DATA = 'PRISM_NO_DATA',
}

@Entity()
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firebaseId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  gender: Gender;

  @Column()
  mobileNumber: string;

  @Column({ nullable: true })
  uhid: string;

  @Column({ nullable: true })
  emailAddress: string;

  @Column({ nullable: true })
  relation: Relation;

  @Column({ nullable: true })
  dateOfBirth: Date;
}
