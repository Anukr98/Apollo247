import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Appointment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    password: string;

    @Column()
    age: number;


}
