import { MigrationInterface, QueryRunner } from "typeorm";
export class consultQueueItemAlterUUID1597147061789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        return await queryRunner.query('select id from appointment limit 1')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
