import { PrimaryGeneratedColumn, Entity, BaseEntity, Column, OneToOne, JoinColumn, ManyToOne, BeforeInsert } from "typeorm";
import { Doctor } from "doctors-service/entities";

enum PLAN {
  ALL = 'ALL',
  CARE_PLAN = 'CARE_PLAN'
}
enum STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Entity()
export class DoctorPricing extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float8' })
  slashed_price: Number

  @Column()
  available_to: PLAN;

  @Column()
  group_plan: String


  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column()
  status: STATUS;

  @Column({ nullable: true })
  doctor_share: Number

  @Column({ type: 'float8' })
  apollo_share: Number

  @ManyToOne((type) => Doctor, (doctor) => { doctor.doctorPricing })
  doctor: Doctor;

}
