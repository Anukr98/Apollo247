import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'
import { Timestamp } from '@google-cloud/firestore';

export enum status {
    INPROGRESS = 'INPROGRESS',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED'
  }

@Entity()
export class Appointments extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column({type:"date"})
  appointmentDate: Date;

  @Column({type:"time"})
  appointmentTime: string;

  @Column()
  appointmentType: string;

  @Column()
  status: status;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  bookingDate: string;

  @Column()
  hospitalId: string;


}
