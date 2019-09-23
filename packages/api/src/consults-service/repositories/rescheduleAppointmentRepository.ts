import { EntityRepository, Repository, Between, Not, Connection } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  RescheduleAppointmentDetails,
  TRANSFER_STATUS,
  Appointment,
  TRANSFER_INITIATED_TYPE,
  STATUS,
} from 'consults-service/entities';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';

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

  async getAppointmentsAndReschedule(
    doctorId: string,
    startDate: Date,
    endDate: Date,
    consultsDb: Connection,
    doctorsDb: Connection,
    patientsDb: Connection
  ) {
    const doctorAppts = await Appointment.find({
      where: {
        doctorId,
        status: Not(STATUS.CANCELLED),
        appointmentDateTime: Between(startDate, endDate),
      },
    });
    console.log(doctorAppts.length, 'appt length');
    if (doctorAppts.length > 0) {
      doctorAppts.map(async (appt) => {
        const rescheduleAppointmentAttrs = {
          appointmentId: appt.id,
          rescheduleReason: '',
          rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
          rescheduleInitiatedId: doctorId,
          autoSelectSlot: 0,
          rescheduledDateTime: new Date(),
          rescheduleStatus: TRANSFER_STATUS.INITIATED,
          appointment: appt,
        };
        const resResponse = await this.rescheduleAppointment(
          rescheduleAppointmentAttrs,
          consultsDb,
          doctorsDb,
          patientsDb
        );
        console.log(resResponse, 'reschedle response');
      });
    }
    return true;
  }

  async rescheduleAppointment(
    rescheduleAppointmentAttrs: Partial<RescheduleAppointmentDetails>,
    consultsDb: Connection,
    doctorsDb: Connection,
    patientsDb: Connection
  ) {
    const rescheduleAppt = await this.findOne({
      where: {
        appointment: rescheduleAppointmentAttrs.appointment,
        rescheduleStatus: TRANSFER_STATUS.INITIATED,
      },
    });
    if (rescheduleAppt) {
      return rescheduleAppt;
    }
    const createReschdule = this.create(rescheduleAppointmentAttrs)
      .save()
      .catch((createErrors) => {
        console.log(createErrors, 'createErrors');
        throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {
          createErrors,
        });
      });
    if (!rescheduleAppointmentAttrs.appointment) {
      throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {});
    }
    // send notification
    const pushNotificationInput = {
      appointmentId: rescheduleAppointmentAttrs.appointment.id,
      notificationType: NotificationType.INITIATE_RESCHEDULE,
    };
    const notificationResult = sendNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult, 'notificationResult');
    return createReschdule;
  }
}
