import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP409811602230351802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ALTER COLUMN "updatedDate" SET default CURRENT_TIMESTAMP;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ALTER COLUMN "updatedDate" SET default NULL;`
    );
  }
}
