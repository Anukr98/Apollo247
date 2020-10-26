import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP41801603712797144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medicine_orders" ADD COLUMN "oldOrderTat" varchar DEFAULT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicine_orders" DROP COLUMN "oldOrderTat";`);
  }
}
