import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany, ManyToOne } from 'typeorm';
import { Validate, IsOptional } from 'class-validator';
import { NameValidator, MobileNumberValidator } from 'validators/entityValidators';

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

export enum SEARCH_TYPE {
  DOCTOR = 'DOCTOR',
  SPECIALTY = 'SPECIALTY',
}

//patient Starts
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
  //@Validate(NameValidator)
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
  //@Validate(EmailValidator)
  emailAddress: string;

  @Column({ nullable: true })
  relation: Relation;

  @Column({ nullable: true })
  //@IsDate()
  dateOfBirth: Date;

  @OneToMany((type) => SearchHistory, (searchHistory) => searchHistory.patient)
  searchHistory: SearchHistory[];
}
//patient Ends

//searchHistory Starts
@Entity()
export class SearchHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: SEARCH_TYPE;

  @Column('uuid')
  typeId: string;

  @ManyToOne((type) => Patient, (patient) => patient.searchHistory)
  patient: Patient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
//searchHistory Ends
