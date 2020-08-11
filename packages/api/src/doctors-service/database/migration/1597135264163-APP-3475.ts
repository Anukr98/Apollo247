import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class APP34751597135264163 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("doctor", new TableColumn({
            name: "migrationCreated",
            type: "int"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
