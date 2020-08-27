import {MigrationInterface, QueryRunner} from "typeorm";

export class APP35041598526192630 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ADD COLUMN IF NOT EXISTS "followUpChatDays" smallint DEFAULT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ADD COLUMN IF NOT EXISTS "followUpChatDays" smallint DEFAULT NULL;`);
    }

}
