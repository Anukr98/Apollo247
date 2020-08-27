import {MigrationInterface, QueryRunner} from "typeorm";

export class APP35041598539008559 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" DROP COLUMN IF EXISTS "followUpChatDays";`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" DROP COLUMN IF EXISTS "followUpChatDays";`);
    }

}
