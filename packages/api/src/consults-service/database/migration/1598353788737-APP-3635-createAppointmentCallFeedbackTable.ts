import { MigrationInterface, QueryRunner } from "typeorm";

export class APP3635CreateAppointmentCallFeedbackTable1598353788737 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE appointment_call_feedback (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "ratingValue" integer NOT NULL,
            "feedbackResponseType" character varying,
            "feedbackResponses" json,
            "createdDate" TIMESTAMP,
            "appointmentCallDetailsId" uuid NOT NULL,
            FOREIGN KEY ("appointmentCallDetailsId") REFERENCES appointment_call_details (id)
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE appointment_call_feedback`)
    }

}
