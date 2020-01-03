import { EntityRepository, Repository } from 'typeorm';
import { AppointmentCallDetails } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { differenceInMinutes } from 'date-fns';

@EntityRepository(AppointmentCallDetails)
export class AppointmentCallDetailsRepository extends Repository<AppointmentCallDetails> {
  saveAppointmentCallDetails(appointmentCallDetailsAttrs: Partial<AppointmentCallDetails>) {
    return this.create(appointmentCallDetailsAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CALL_DETAILS_ERROR, undefined, { createErrors });
      });
  }

  async updateCallDetails(id: string) {
    const callDetails = await this.findOne({ where: { id } });
    let duration = 0;
    if (callDetails && callDetails.startTime != null) {
      duration = Math.abs(differenceInMinutes(new Date(), callDetails.startTime));
    }
    return this.update(id, {
      endTime: new Date(),
      callDuration: duration,
      updatedDate: new Date(),
    });
  }

  getCallDetails(id: string) {
    return this.findOne({ where: { id } });
  }

  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointment: appointmentId } });
  }
}
