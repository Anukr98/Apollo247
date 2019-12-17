import { EntityRepository, Repository } from 'typeorm';
import { AppointmentCallDetails } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(AppointmentCallDetails)
export class AppointmentCallDetailsRepository extends Repository<AppointmentCallDetails> {
  saveAppointmentCallDetails(appointmentCallDetailsAttrs: Partial<AppointmentCallDetails>) {
    return this.create(appointmentCallDetailsAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CALL_DETAILS_ERROR, undefined, { createErrors });
      });
  }

  updateCallDetails(id: string) {
    return this.update(id, { endTime: new Date(), updatedDate: new Date() });
  }

  getCallDetails(id: string) {
    return this.findOne({ where: { id } });
  }

  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointment: appointmentId } });
  }
}
