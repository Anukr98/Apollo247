import {MigrationInterface, QueryRunner} from "typeorm";

export class APP35041598365772406 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ADD COLUMN "followUpChatDays" float8 DEFAULT 7;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" DROP COLUMN "followUpChatDays";`);
    }

}
