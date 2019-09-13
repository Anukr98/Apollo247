import { EntityRepository, Repository } from 'typeorm';
import { JuniorAppointmentSessions } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(JuniorAppointmentSessions)
export class JuniorAppointmentsSessionRepository extends Repository<JuniorAppointmentSessions> {
  saveJuniorAppointmentSession(appointmentSessionAttrs: Partial<JuniorAppointmentSessions>) {
    return this.create(appointmentSessionAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  updateJuniorAppointmentSession(patientToken: string, id: string) {
    return this.update(id, { patientToken });
  }

  getJuniorAppointmentSession(appointment: string) {
    return this.findOne({ where: { appointment } });
  }

  endJuniorAppointmentSession(id: string, consultEndDateTime: Date) {
    return this.update(id, { consultEndDateTime });
  }
}
