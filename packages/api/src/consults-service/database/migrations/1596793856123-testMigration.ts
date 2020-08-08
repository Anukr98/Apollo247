import { MigrationInterface, QueryRunner } from "typeorm";

export class testMigration1596793856123 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE consult_queue_item ALTER COLUMN "appointmentId" SET DATA TYPE UUID USING (uuid_generate_v4())`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
