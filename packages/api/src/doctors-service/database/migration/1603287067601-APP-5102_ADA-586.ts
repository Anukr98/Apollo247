import {MigrationInterface, QueryRunner} from "typeorm";

export class APP5102ADA5861603287067601 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "doctor" ADD "isPlatinum" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "isPlatinum"`);
    }

}
