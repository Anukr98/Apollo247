import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP52441603086507461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ADD COLUMN "storeDistanceKm" float DEFAULT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_orders" DROP COLUMN "storeDistanceKm";`);
  }
}
