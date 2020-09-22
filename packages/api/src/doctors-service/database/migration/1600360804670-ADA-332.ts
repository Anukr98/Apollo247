import { MigrationInterface, QueryRunner } from 'typeorm';

export class ADA3321600360804670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin_filter_mapper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filter_type" text, "filter_name" text, "filter_id" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "adminuserId" uuid, CONSTRAINT "PK_caf94e91a32a14cce8bc790303a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "auditor_filter_mapper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filter_type" text, "filter_name" text, "filter_id" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "auditorId" uuid, "adminuserId" uuid, CONSTRAINT "PK_a636cacb1ab08ccd517efbaa5da" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "auditor_filter_mapper" 
      ADD CONSTRAINT "FK_2cf425138df19b3a4bc356698f0" FOREIGN KEY ("auditorId") REFERENCES "auditor"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "auditor_filter_mapper" 
      ADD CONSTRAINT "FK_5d118ea5aff395914c9743dee86" 
      FOREIGN KEY ("adminuserId") REFERENCES "admin_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
