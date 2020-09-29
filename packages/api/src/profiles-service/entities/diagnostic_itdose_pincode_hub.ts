import { Entity, BaseEntity, PrimaryGeneratedColumn, Index, Column } from 'typeorm';

@Entity()
export class DiagnosticItdosePincodeHubs extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('DiagnosticItdosePincodeHubs_pincode')
    @Column({ nullable: true })
    pincode: number;

    @Column({ nullable: true })
    area_id: number;

    @Column({ nullable: true })
    area: string;

    @Column({ nullable: true })
    city_id: number;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state_id: number;

    @Column({ nullable: true })
    state: string;
}