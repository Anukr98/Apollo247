import { MigrationInterface, QueryRunner } from 'typeorm';

export class APP44541602837734354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE medicine_order_hold_reasons (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "reasonCode" varchar,
            "reUploadPrescription" boolean,
            "enableChatSupport" boolean,
            "showOnHold" boolean,
            "diplayText" varchar,
            "createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`);
    if (process.env.NODE_ENV !== 'production') {
      await queryRunner.query(`INSERT INTO medicine_order_hold_reasons ("reasonCode", "reUploadPrescription", "enableChatSupport", "showOnHold", "diplayText") values 
      ('RS2111', true,  true, true, 'Your Order is On Hold as your prescription is expired. Please re-upload a valid prescription within last 1 year.'),
      ('RS2112', false, false, false, null),
      ('RS2113', false, true, true, 'We were unable to reach you. Please chat with our Agent to provide necessary details so we can process your order faster');`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE medicine_order_hold_reasons`);
  }
}
