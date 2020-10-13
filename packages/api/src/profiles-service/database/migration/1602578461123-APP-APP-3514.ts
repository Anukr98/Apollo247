import { MigrationInterface, QueryRunner } from 'typeorm';

export class APPAPP35141602578461123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_order_shipments" ADD COLUMN "driverDetails" jsonb NULL DEFAULT '{}';`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_order_shipments" DROP COLUMN "driverDetails";`);
  }
}
