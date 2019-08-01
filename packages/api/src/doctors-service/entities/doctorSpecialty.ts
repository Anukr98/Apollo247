import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Doctor } from 'doctors-service/entities/doctor';

@Entity()
export class DoctorSpecialty extends BaseEntity {
  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column()
  name: String;

  @Column({ nullable: true, type: 'text' })
  image: String;

  @OneToMany((type) => Doctor, (doctor) => doctor.specialty)
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
