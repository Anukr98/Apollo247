import { MigrationInterface, QueryRunner } from "typeorm";

export class APP41261599402489569 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE health_check_records (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "healthCheckName" character varying NOT NULL,
            "healthCheckDate" TIMESTAMP NOT NULL,
            "recordType" character varying NOT NULL,
            "documentURLs" text,
            "prismFileIds" integer,
            "createdDate" TIMESTAMP,
            "updatedDate" TIMESTAMP,
            "patientId" uuid NOT NULL,
            FOREIGN KEY ("patientId") REFERENCES patient (id)
        )`);

        await queryRunner.query(`CREATE TABLE hospitalization_records (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "hospitalName" character varying NOT NULL,
            "doctorName" character varying NOT NULL,
            "dischargeDate" TIMESTAMP NOT NULL,
            "recordType" character varying NOT NULL,
            "documentURLs" text,
            "prismFileIds" integer,
            "createdDate" TIMESTAMP,
            "updatedDate" TIMESTAMP,
            "patientId" uuid NOT NULL,
            FOREIGN KEY ("patientId") REFERENCES patient (id)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE health_check_records`)

        await queryRunner.query(`DROP TABLE hospitalization_records`)
    }

}
