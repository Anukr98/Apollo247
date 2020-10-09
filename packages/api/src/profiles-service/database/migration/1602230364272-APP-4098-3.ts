import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP409831602230364272 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_order_status" ALTER COLUMN "updatedDate" TIMESTAMP default CURRENT_TIMESTAMP;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_order_status" ALTER COLUMN "updatedDate" TIMESTAMP default NULL;`
    );
  }
}
