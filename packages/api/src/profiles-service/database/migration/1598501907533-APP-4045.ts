import { MigrationInterface, QueryRunner } from "typeorm";

export class APP40451598501907533 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_address" ADD COLUMN "name" varchar DEFAULT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_address" DROP COLUMN "name";`);
    }

}
