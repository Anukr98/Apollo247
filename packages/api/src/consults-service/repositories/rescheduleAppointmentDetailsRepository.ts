import { EntityRepository, Repository, Connection } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  RescheduleAppointmentDetails,
  TRANSFER_STATUS,
  TRANSFER_INITIATED_TYPE,
  Appointment,
} from 'consults-service/entities';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

@EntityRepository(RescheduleAppointmentDetails)
export class RescheduleAppointmentDetailsRepository extends Repository<
  RescheduleAppointmentDetails
> {
  async getAppointmentsAndReschedule(
    doctorId: string,
    startDate: Date,
    endDate: Date,
    consultsDb: Connection,
    doctorsDb: Connection,
    patientsDb: Connection
  ) {
    const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
    const doctorAppts = await apptRepo.getDoctorAppointmentsByDates(doctorId, startDate, endDate);
    console.log(doctorAppts.length, 'appt length');
    if (doctorAppts.length > 0) {
      doctorAppts.map(async (appt) => {
        const rescheduleAppointmentAttrs = {
          rescheduleReason: '',
          rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
          rescheduleInitiatedId: doctorId,
          autoSelectSlot: 0,
          rescheduledDateTime: new Date(),
          rescheduleStatus: TRANSFER_STATUS.INITIATED,
          appointment: appt,
        };
        const rescheduleAppt = await this.findRescheduleRecord(
          rescheduleAppointmentAttrs.appointment
        );
        console.log(rescheduleAppt, 'rescheduleAppt');
        if (rescheduleAppt) {
          return rescheduleAppt;
        }
        const createReschdule = await this.save(this.create(rescheduleAppointmentAttrs)).catch(
          (createErrors) => {
            console.log(createErrors, 'createErrors');
            throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {
              createErrors,
            });
          }
        );
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
        console.log(notificationResult, createReschdule, 'notificationResult');
      });
    }
    return true;
  }

  findRescheduleRecord(appointment: Appointment) {
    return this.findOne({
      where: { appointment, rescheduleStatus: TRANSFER_STATUS.INITIATED },
    });
  }
}
