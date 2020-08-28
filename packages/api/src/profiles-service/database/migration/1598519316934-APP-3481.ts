import { MigrationInterface, QueryRunner } from "typeorm";

export class APP34811598519316934 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diagnostic_orders" ADD COLUMN "slotId" varchar DEFAULT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diagnostic_orders" DROP COLUMN "slotId";`);
    }

}