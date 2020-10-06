import {MigrationInterface, QueryRunner} from "typeorm";

export class APP40101598500379533 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_specialty" DROP COLUMN "commonSearchWords";`);
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_specialty" ADD COLUMN "commonSearchWords" VARCHAR DEFAULT NULL;`);
    }

}
