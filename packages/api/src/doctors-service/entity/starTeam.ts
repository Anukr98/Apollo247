import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import { Doctor } from 'doctors-service/entity/doctor';

@Entity()
export class StarTeam extends BaseEntity {
  @Column()
  createdDate: Date;

  @Column()
  associatedDoctor: String;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @ManyToOne((type) => Doctor, (doctor) => doctor.starTeam)
  doctor: Doctor;

  @Column()
  starDoctor: String;

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
