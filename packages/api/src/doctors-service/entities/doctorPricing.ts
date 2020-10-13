import { PrimaryGeneratedColumn, Entity, BaseEntity, Column, OneToOne, JoinColumn } from "typeorm";
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
export class DoctorProfileHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  slashed_price: Number

  @Column({ nullable: true })
  available_to: PLAN;

  @Column({ nullable: true })
  group_plan: String

  @Column({ nullable: true, type: 'timestamp' })
  start_date: Date;

  @Column({ nullable: true, type: 'timestamp' })
  end_date: Date;

  @Column({ nullable: true })
  status: STATUS;

  @Column({ nullable: true })
  doctor_share: Number

  @Column({ nullable: true })
  apollo_share: Number

  @OneToOne((type) => Doctor)
  @JoinColumn()
  fk_doctor_id: Doctor;
}
