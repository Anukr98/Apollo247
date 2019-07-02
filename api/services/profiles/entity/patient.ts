import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

export enum Sex {
  NOT_KNOWN = 'NOT_KNOWN',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
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
  firebaseId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  sex: Sex;

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
