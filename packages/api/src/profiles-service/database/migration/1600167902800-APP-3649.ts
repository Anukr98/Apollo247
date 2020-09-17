import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP6491600167902800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_medical_history" ADD "clinicalObservationNotes" text, ADD "diagnosticTestResult" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_medical_history" DROP COLUMN "clinicalObservationNotes", DROP COLUMN "diagnosticTestResult"`
    );
  }
}
