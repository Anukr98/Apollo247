import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AdminUsers } from 'doctors-service/entities';

@Entity()
export class AdminFilterMapper extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true, type: 'text' })
  filter_type: String;
  @Column({ nullable: true, type: 'text' })
  filter_name: String;
  @Column({ nullable: true, type: 'text' })
  filter_id: String;
  @ManyToOne((type) => AdminUsers, (adminuser) => adminuser.admindoctormapper)
  adminuser: AdminUsers;
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
