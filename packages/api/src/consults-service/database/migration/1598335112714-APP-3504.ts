import {MigrationInterface, QueryRunner} from "typeorm";

export class APP35041598335112714 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ALTER COLUMN "followUpAfterInDays" SET DEFAULT 7;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_sheet" ALTER COLUMN "followUpAfterInDays SET DEFAULT NULL"`)
    }

}
