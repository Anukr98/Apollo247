import { MigrationInterface, QueryRunner } from "typeorm";

export class APP50721602522893535 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE doctor_pricing (
      slashed_price float
      available_to varchar
      group_plan varchar
      start_date 
      end_date
      status
      fk_doctor_id
      doctor_share
      apollo_share
    )`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
