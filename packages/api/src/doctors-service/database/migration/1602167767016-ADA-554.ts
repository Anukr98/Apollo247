import { MigrationInterface, QueryRunner } from "typeorm";

export class ADA5541602167767016 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE doctor_bank_accounts 
    ADD COLUMN "panCard"  character varying COLLATE pg_catalog."default",
    ADD COLUMN "typeOfService"  character varying COLLATE pg_catalog."default",
    ADD COLUMN "isPennyRequried" boolean NOT NULL DEFAULT true,
    ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
    ADD COLUMN "branchName"  character varying COLLATE pg_catalog."default"`);


    await queryRunner.query(`ALTER TABLE admin_sub_roles
    ADD COLUMN "editBankDetails" boolean NOT NULL DEFAULT true`);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
    ALTER TABLE doctor_bank_accounts 
    DROP COLUMN "panCard" ,
    DROP COLUMN "typeOfService",
    DROP COLUMN  "isPennyRequried" ,
    DROP COLUMN  "isActive",
    DROP COLUMN "branchName"`);

    await queryRunner.query(`ALTER TABLE admin_sub_roles DROP COLUMN "editBankDetails"`);
  }

}
