import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP44651603774856974 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ADD COLUMN "prescriptionOptionSelected" varchar DEFAULT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" DROP COLUMN "prescriptionOptionSelected";`
    );
  }
}
