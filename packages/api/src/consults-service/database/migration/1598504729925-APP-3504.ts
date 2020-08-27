import {MigrationInterface, QueryRunner} from "typeorm";

export class APP35041598504729925 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ALTER COLUMN "followUpChatDays" SET DATA TYPE SMALLINT;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ALTER COLUMN "followUpChatDays" SET DATA TYPE float8;`);
    }

}
