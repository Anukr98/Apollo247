import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    OneToMany,
    ManyToOne,
    OneToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
    Index,
    AfterUpdate,
    AfterInsert,
    EventSubscriber,
    EntitySubscriberInterface,
    UpdateEvent,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

import { Patient, MedicalRecordType } from 'profiles-service/entities/'

@Entity()
export class HealthCheckRecords extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: "enum",
        enum: MedicalRecordType
    })
    recordType: MedicalRecordType

    @Column()
    healthCheckName: string

    @Column()
    healthCheckDate: Date

    @Column({ nullable: true })
    documentURLs: string

    @Column({ nullable: true })
    prismFileIds: string

    @ManyToOne(
        (type) => Patient,
        (patient) => patient.medicalRecords
    )
    patient: Patient;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}