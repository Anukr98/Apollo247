import {MigrationInterface, QueryRunner} from "typeorm";

export class APP35041598526476625 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ALTER COLUMN "followUpChatDays" SET DEFAULT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ALTER COLUMN "followUpChatDays" SET DEFAULT 7;`);
    }

}
