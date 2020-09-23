import {MigrationInterface, QueryRunner} from "typeorm";

export class APP47441600842504566 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "diagnostics" ADD COLUMN "subCategoryid" integer;`
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diagnostics" DROP COLUMN "subCategoryid";`);
    }

}
