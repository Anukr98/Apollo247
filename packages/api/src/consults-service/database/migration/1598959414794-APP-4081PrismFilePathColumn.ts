import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP4081PrismFilePathColumn1598959414794 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment_documents" ADD COLUMN "prismFilePath" character varying DEFAULT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointment_documents" DROP COLUMN "prismFilePath"`);
  }
}
