import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentNoShow } from 'consults-service/entities';

@EntityRepository(AppointmentNoShow)
export class AppointmentNoShowRepository extends Repository<AppointmentNoShow> {
  saveNoShow(appointmentNoShowAttrs: Partial<AppointmentNoShow>) {
    return this.create(appointmentNoShowAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.APPOINTMENT_NO_SHOW_ERROR, undefined, {
          createErrors,
        });
      });
  }
}
