import { MigrationInterface, QueryRunner } from "typeorm";

export class APP3635CreateAppointmentCallFeedbackTable1598353788737 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE appointment_call_feedback (
            id UUID PRIMARY KEY,
            ratingValue INT NOT NULL,
            feedbackResponseType VARCHAR,
            feedbackResponses JSON,
            createdDate TIMESTAMP,
            FOREIGN KEY (appointmentCallDetailsId) REFERENCES appointment_call_details (id)
        )`);

        await queryRunner.query(`ALTER TABLE appointment_call_details ADD FOREIGN KEY (appointmentCallFeedback) REFERENCES appointment_call_feedback (id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE appointment_call_feedback`)

        await queryRunner.query(`ALTER TABLE appointment_call_details DROP CONSTRAINT appointmentCallFeedback`);
    }

}
