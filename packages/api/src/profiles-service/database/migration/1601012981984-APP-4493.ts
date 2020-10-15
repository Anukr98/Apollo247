import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP44931601012981984 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD COLUMN "image" varchar DEFAULT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "search_history" DROP COLUMN "image";`);
  }
}
