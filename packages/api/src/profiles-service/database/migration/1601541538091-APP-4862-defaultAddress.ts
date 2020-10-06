import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP4862DefaultAddress1601541538091 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table patient_address add column "defaultAddress" boolean default false;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`alter table patient_address drop column "defaultAddress" ;`);
  }
}
