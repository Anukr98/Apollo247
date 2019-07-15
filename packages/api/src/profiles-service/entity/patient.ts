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
