import { MigrationInterface, QueryRunner } from "typeorm";

export class APP44371600606168130 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ADD "isIvrSet" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "ivrConsultType" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "ivrCallTimeOnline" smallint`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "ivrCallTimePhysical" smallint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "isIvrSet"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "ivrConsultType"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "ivrCallTimeOnline"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "ivrCallTimePhysical"`);
    }
}
