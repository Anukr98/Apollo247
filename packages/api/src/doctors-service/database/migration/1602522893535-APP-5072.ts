import { MigrationInterface, QueryRunner } from "typeorm";

export class APP50721602522893535 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "doctor_pricing" 
    ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
    "slashed_price" double precision NOT NULL, 
    "available_to" character varying NOT NULL, 
    "group_plan" character varying NOT NULL, 
    "start_date" TIMESTAMP NOT NULL, 
    "end_date" TIMESTAMP NOT NULL, 
    "status" character varying NOT NULL, 
    "doctor_share" integer, 
    "apollo_share" double precision NOT NULL, 
    "doctorId" uuid, 
    CONSTRAINT "REL_3329ae85f25512de95da6b2265" UNIQUE ("doctorId"),
    CONSTRAINT "PK_6a33b7f5d4e752fe5288e5540cc" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "doctor_pricing"`);
  }

}
