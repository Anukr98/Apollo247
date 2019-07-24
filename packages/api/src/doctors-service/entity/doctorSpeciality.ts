import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Doctor } from 'doctors-service/entity/doctor';

@Entity()
export class DoctorSpeciality extends BaseEntity {
  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column()
  name: String;

  @OneToMany((type) => Doctor, (doctor) => doctor.speciality)
  doctor: Doctor[];

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
