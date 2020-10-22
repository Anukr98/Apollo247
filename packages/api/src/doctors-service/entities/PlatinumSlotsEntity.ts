import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeUpdate,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn, Between, Not, In, LessThan
} from 'typeorm';

import {Doctor, DoctorSpecialty} from './index'

@Entity()
export class PlatinumSlots extends BaseEntity {

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
createdDate: Date;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
updatedDate: Date;

// @ManyToOne("Doctor",'PlatinumSlots')
// doctor: Doctor;

@ManyToOne(
  (type) => Doctor,
  (doctor) => doctor.platinumSlots
)
doctor: Doctor;

// @ManyToOne("DoctorSpecialty",'PlatinumSlots')
// specialty: DoctorSpecialty;

@ManyToOne(
  (type) => DoctorSpecialty,
  (specialty) => specialty.platinumSlots
)
specialty: DoctorSpecialty;

@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
startTime: Date;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
endTime: Date;

@Column({nullable:false})
status: string;

@Column({ nullable: true, default:() => '' })
cancelledById: string;

@Column({ nullable: true, default:() => '' })
cancelledByUserName: string;

@Column({ nullable: true })
cancelledReason: string;

@Column({ nullable: true })
createdById: string;

@Column({ nullable: true })
createdByUserName: string;

@Column({ nullable: true })
createdByEmail: string;
@BeforeInsert()
@BeforeUpdate()
async validateInputData() {
  this.createdDate = new Date();
  this.updatedDate = new Date();
  const startTime = new Date(this.startTime)
  const endTime = new Date(this.endTime)
  const result1 = await PlatinumSlots.find({
      where: {
          startTime: Between(startTime, endTime),
          status: Not('CANCELLED')
      },
  })
  const result2 = await PlatinumSlots.find({
      where: {
          endTime: Between(startTime, endTime),
          status: Not('CANCELLED')
      },
  })
  if(result1) {
      throw new Error('SLOT_ALLOTTED_FOR_START_TIME')
  }

  if(result2) {
      throw new Error('SLOT_ALLOTTED_FOR_END_TIME')
  }
}
}
