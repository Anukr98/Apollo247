import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from 'doctors-service/entity/doctor';

@Entity()
export class StarTeam extends BaseEntity {
  @Column()
  createdDate: Date;

  @OneToOne((type) => Doctor)
  @JoinColumn()
  associatedDoctor: Doctor;

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
