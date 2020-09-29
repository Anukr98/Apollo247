import { MigrationInterface, QueryRunner } from "typeorm";

export class APP45911601230386354 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS "hideHealthRecordNudge" boolean DEFAULT false;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN IF EXISTS "hideHealthRecordNudge";`);
    }

}
