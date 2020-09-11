import {MigrationInterface, QueryRunner, Table, TableColumn} from "typeorm";

export class APP35041598333660551 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ADD COLUMN "chatDays" float8 DEFAULT 7;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "chatDays";`);
    }

}
