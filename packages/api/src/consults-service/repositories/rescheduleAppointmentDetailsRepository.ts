import { EntityRepository, Repository, Connection } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  RescheduleAppointmentDetails,
  TRANSFER_STATUS,
  TRANSFER_INITIATED_TYPE,
  Appointment,
  APPOINTMENT_STATE,
} from 'consults-service/entities';
import { sendNotification } from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
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
    if (doctorAppts.length > 0) {
      doctorAppts.map(async (appt) => {
        const rescheduleAppointmentAttrs: Partial<RescheduleAppointmentDetails> = {
          rescheduleReason: '',
          rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
          rescheduleInitiatedId: doctorId,
          rescheduledDateTime: new Date(),
          rescheduleStatus: TRANSFER_STATUS.INITIATED,
          appointment: appt,
        };
        const rescheduleAppt = await this.findRescheduleRecord(appt);
        console.log(rescheduleAppt, 'rescheduleAppt');
        if (!rescheduleAppt) {
          const createReschdule = await this.save(this.create(rescheduleAppointmentAttrs)).catch(
            (createErrors) => {
              console.log(createErrors, 'createErrors');
              throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {
                createErrors,
              });
            }
          );

          await apptRepo.updateTransferState(appt.id, APPOINTMENT_STATE.AWAITING_RESCHEDULE, appt);

          // send notification
          const pushNotificationInput = {
            appointmentId: appt.id,
            notificationType: NotificationType.INITIATE_RESCHEDULE,
          };
          const notificationResult = sendNotification(
            pushNotificationInput,
            patientsDb,
            consultsDb,
            doctorsDb
          );
          console.log(notificationResult, createReschdule, 'notificationResult');
        }
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
