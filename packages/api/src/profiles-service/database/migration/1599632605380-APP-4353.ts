import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP43531599632605380 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ADD COLUMN "tatType" varchar DEFAULT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_orders" DROP COLUMN "tatType";`);
  }
}
