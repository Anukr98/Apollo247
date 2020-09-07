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
export class HospitalizationRecords extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: "enum",
        enum: MedicalRecordType
    })
    recordType: MedicalRecordType

    @Column()
    hospitalName: string

    @Column()
    dischargeDate: Date

    @Column()
    doctorName: string

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