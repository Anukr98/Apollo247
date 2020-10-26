import {MigrationInterface, QueryRunner} from "typeorm";

export class APP5102PlatinumSlots1603109324945 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `CREATE TABLE IF NOT EXISTS "platinum_slots" (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "doctorId" uuid NOT NULL ,
            "specialtyId" uuid NOT NULL ,
            "startTime" timestamp without time zone NOT NULL ,
            "endTime" timestamp without time zone NOT NULL ,
            "createdByUserName" varchar(100) NOT NULL ,
            "status" varchar(20) NOT NULL ,
            "cancelledByUserName" varchar(100) ,
            "cancelledReason" varchar(100) ,
            "updatedDate" timestamp without time zone,
            "createdDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("doctorId") REFERENCES doctor (id),
            FOREIGN KEY ("specialtyId") REFERENCES doctor_specialty (id)
        )`
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
