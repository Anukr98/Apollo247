import {MigrationInterface, QueryRunner} from "typeorm";

export class APP35041598501291399 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "chatDays" SET DATA TYPE SMALLINT;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "chatDays" SET DATA TYPE float8;`);
    }

}
