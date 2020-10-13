import { MigrationInterface, QueryRunner } from "typeorm";

export class ADA554viewBankDetailsColumn1602517199193 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE admin_sub_roles ADD COLUMN "viewBankDetails" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE admin_sub_roles DROP COLUMN "viewBankDetails"`);
  }

}
