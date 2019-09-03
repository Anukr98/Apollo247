import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { RescheduleAppointmentDetails } from 'consults-service/entities';

@EntityRepository(RescheduleAppointmentDetails)
export class RescheduleAppointmentRepository extends Repository<RescheduleAppointmentDetails> {
  saveReschedule(rescheduleAppointmentAttrs: Partial<RescheduleAppointmentDetails>) {
    return this.create(rescheduleAppointmentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {
          createErrors,
        });
      });
  }

  checkTransfer(appointment: string, transferedDocotrId: string) {
    return this.count({ where: { appointment, transferedDocotrId } });
  }
}
