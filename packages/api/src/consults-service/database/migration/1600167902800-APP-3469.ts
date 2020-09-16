import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP34691600167902800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "case_sheet" ADD "clinicalObservationNotes" text, ADD "diagonasticTestResult" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "case_sheet" DROP COLUMN "clinicalObservationNotes", DROP COLUMN "diagonasticTestResult"`
    );
  }
}
