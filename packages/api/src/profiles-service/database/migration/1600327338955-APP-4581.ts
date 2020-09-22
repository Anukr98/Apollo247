import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP45811600327338955 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ADD COLUMN "clusterId" varchar DEFAULT NULL;`
    );
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ADD COLUMN "allocationProfileName" varchar DEFAULT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_orders" DROP COLUMN "clusterId";`);
    await queryRunner.query(`ALTER TABLE "medicine_orders" DROP COLUMN "allocationProfileName";`);
  }
}
