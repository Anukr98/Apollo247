import { EntityRepository, Repository, Connection } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { RescheduleAppointmentDetails, TRANSFER_STATUS } from 'consults-service/entities';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';

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

  updateReschedule(id: string, rescheduleStatus: TRANSFER_STATUS) {
    return this.update(id, { rescheduleStatus });
  }

  async rescheduleAppointment(rescheduleAppointmentAttrs: Partial<RescheduleAppointmentDetails>) {
    const recCount = await this.count({
      where: {
        appointment: rescheduleAppointmentAttrs.appointment,
        rescheduleStatus: TRANSFER_STATUS.INITIATED,
      },
    });
    if (recCount > 0) {
      throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {});
    }
    const createReschdule = this.create(rescheduleAppointmentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {
          createErrors,
        });
      });

    if (rescheduleAppointmentAttrs.appointment) {
      // send notification
      const pushNotificationInput = {
        appointmentId: rescheduleAppointmentAttrs.appointment.id,
        notificationType: NotificationType.INITIATE_RESCHEDULE,
      };
      const context: Partial<ConsultServiceContext> = {};
      if (!context.consultsDb || !context.patientsDb || !context.doctorsDb) {
        throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {});
      }

      const notificationResult = sendNotification(
        pushNotificationInput,
        context.patientsDb,
        context.consultsDb,
        context.doctorsDb
      );

      console.log(notificationResult, 'notificationResult');
    }
    return createReschdule;
  }
}
