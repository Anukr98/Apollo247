import { MigrationInterface, QueryRunner } from "typeorm";

export class APP404531598872588844 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "patient_address" 
        SET "name" = (
            SELECT CONCAT(coalesce("firstName",''), ' ', coalesce("lastName",''))
            FROM "patient"
            WHERE "patient"."id" = "patient_address"."patientId"
        ) where "name" is null;`);

        await queryRunner.query(`UPDATE "patient_address" 
        SET "mobileNumber" = (
            SELECT "mobileNumber"
            FROM "patient"
            WHERE "patient"."id" = "patient_address"."patientId"
        ) where "mobileNumber" is null;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
