import {MigrationInterface, QueryRunner} from "typeorm";

export class APP5102PlatinumSlots1603109324945 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `CREATE TABLE IF NOT EXISTS "platinum_slots" (
            "createdDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            "doctorId" uuid NOT NULL ,
            "specialtyId" uuid NOT NULL ,
            "startTime" timestamp without time zone NOT NULL ,
            "endTime" timestamp without time zone NOT NULL ,
            "createdById" varchar(100) NOT NULL ,
            "createdByUserName" varchar(100) NOT NULL ,
            "createdByEmail" varchar(100) NOT NULL ,
            "status" varchar(20) NOT NULL ,
            "cancelledById" varchar(100)  ,
            "cancelledByUserName" varchar(100) ,
            "cancelledReason" varchar(100) ,
            "updatedDate" timestamp without time zone
        )`
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
