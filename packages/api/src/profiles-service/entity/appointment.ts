import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { IsDate } from 'class-validator';

export enum STATUS {
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum APPOINTMENT_TYPE {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
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

  @Column({ type: 'timestamp' })
  appointmentTime: Date;

  @Column()
  appointmentType: APPOINTMENT_TYPE;

  @Column()
  status: STATUS;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  @Column({ nullable: true })
  hospitalId: string;
}
