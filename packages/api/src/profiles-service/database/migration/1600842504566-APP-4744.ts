<<<<<<< HEAD
import {MigrationInterface, QueryRunner} from "typeorm";

export class APP47441600842504566 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "diagnostics" ADD COLUMN "subCategoryId" integer;`
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diagnostics" DROP COLUMN "subCategoryId";`);
    }

=======
import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP47441600842504566 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "diagnostics" ADD COLUMN "subCategoryId" integer;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "diagnostics" DROP COLUMN "subCategoryId";`);
  }
>>>>>>> dd4424302c7871e5f39232d0300dfa52a9517f83
}
