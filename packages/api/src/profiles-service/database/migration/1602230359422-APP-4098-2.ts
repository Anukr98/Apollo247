import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP409821602230359422 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_order_shipments" ALTER COLUMN "updatedDate" SET default CURRENT_TIMESTAMP;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_order_shipments" ALTER COLUMN "updatedDate" SET default NULL;`
    );
  }
}
