import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import { Doctor } from 'doctors-service/entities';

@Entity()
export class StarTeam extends BaseEntity {
  @Column()
  createdDate: Date;

  @Column()
  associatedDoctor: String;

  @PrimaryGeneratedColumn('uuid')
  id: String;

  @ManyToOne((type) => Doctor, (doctor) => doctor.starTeam)
  starDoctor: Doctor;

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
