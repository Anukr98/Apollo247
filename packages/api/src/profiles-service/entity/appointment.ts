import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { IsDate } from 'class-validator';

export enum STATUS {
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Appointments extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column({ type: 'date' })
  @IsDate()
  appointmentDate: Date;

  @Column({ type: 'time' })
  appointmentTime: string;

  @Column()
  appointmentType: string;

  @Column()
  status: STATUS;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: string;

  @Column()
  hospitalId: string;
}
