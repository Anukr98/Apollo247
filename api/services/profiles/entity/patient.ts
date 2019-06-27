import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

export enum Sex {
  NOT_KNOWN = 'NOT_KNOWN',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
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
}
