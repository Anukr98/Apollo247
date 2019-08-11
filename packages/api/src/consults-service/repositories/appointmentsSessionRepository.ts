import { EntityRepository, Repository } from 'typeorm';
import { AppointmentSessions } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(AppointmentSessions)
export class AppointmentsSessionRepository extends Repository<AppointmentSessions> {
  saveAppointmentSession(appointmentSessionAttrs: Partial<AppointmentSessions>) {
    return this.create(appointmentSessionAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  updateAppointmentSession(patientToken: string, id: string) {
    return this.update(id, { patientToken });
  }

  getAppointmentSession(appointment: string) {
    return this.findOne({ where: { appointment } });
  }
}
