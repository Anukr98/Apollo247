import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import { Doctor } from 'doctors-service/entities/doctor';

export enum AccountType {
  CURRENT,
  SAVINGS,
}

@Entity()
export class DoctorBankAccounts extends BaseEntity {
  @Column()
  accountHolderName: String;

  @Column()
  accountNumber: String;

  @Column({ type: String })
  accountType: AccountType;

  @Column()
  bankName: String;

  @Column({ nullable: true })
  city: String;

  @Column()
  createdDate: Date;

  @ManyToOne((type) => Doctor, (doctor) => doctor.bankAccount)
  doctor: Doctor;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column()
  IFSCcode: String;

  @Column({ nullable: true })
  state: String;

  @Column({ nullable: true, type: 'text' })
  streetLine1: String;

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
