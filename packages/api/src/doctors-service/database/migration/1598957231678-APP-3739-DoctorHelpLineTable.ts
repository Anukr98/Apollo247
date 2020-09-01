import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP3739DoctorHelpLineTable1598957231678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE  doctor_help_line(
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "doctorType" character varying,
      "mobileNumber" character varying)`);
    await queryRunner.query(`INSERT INTO doctor_help_line ("doctorType", "mobileNumber") values 
    ('APOLLO', '04048217273'),
    ('APOLLO_HOMECARE', '04048217273'),
    ('CLINIC', '04048217273'),
    ('CRADLE', '04048217273'),
    ('FERTILITY', '04048217273'),
    ('PAYROLL', '04048217273'),
    ('STAR_APOLLO', '04048217273'),
    ('SPECTRA', '04048217273'),
    ('SUGAR', '04048217273'),
    ('WHITE_DENTAL', '04048217273'),
    ('DOCTOR_CONNECT', '04045208102');`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE doctor_help_line`);
  }
}
