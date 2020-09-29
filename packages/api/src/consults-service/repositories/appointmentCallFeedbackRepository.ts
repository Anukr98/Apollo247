import { EntityRepository, Repository } from 'typeorm';
import { AppointmentCallFeedback } from '../entities/appointmentCallFeedbackEntity';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(AppointmentCallFeedback)
export class AppointmentCallFeedbackRepository extends Repository<AppointmentCallFeedback>{

    async saveAppointmentCallFeedback(appointmentCallFeedbackAttrs: Partial<AppointmentCallFeedback>) {
        try {
            return this.create(appointmentCallFeedbackAttrs).save()
        } catch (err) {
            throw new AphError(AphErrorMessages.CALL_DETAILS_ERROR, undefined, { err });
        }
    }
}