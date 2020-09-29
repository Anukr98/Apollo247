import { EntityRepository, Repository, Connection, getConnection } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  RescheduleAppointmentDetails,
  TRANSFER_STATUS,
  TRANSFER_INITIATED_TYPE,
  Appointment,
} from 'consults-service/entities';
import { sendNotification } from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';

import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

@EntityRepository(RescheduleAppointmentDetails)
export class RescheduleAppointmentRepository extends Repository<RescheduleAppointmentDetails> {
  async saveReschedule(rescheduleAppointmentAttrs: Partial<RescheduleAppointmentDetails>) {
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
    const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
    const doctorAppts = await apptRepo.getDoctorAppointmentsByDates(doctorId, startDate, endDate);
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
      });
    }
    return true;
  }

  findRescheduleRecord(appointment: Appointment) {
    return this.findOne({
      where: { appointment, rescheduleStatus: TRANSFER_STATUS.INITIATED },
    });
  }

  async rescheduleAppointment(
    rescheduleAppointmentAttrs: Partial<RescheduleAppointmentDetails>,
    consultsDb: Connection,
    doctorsDb: Connection,
    patientsDb: Connection
  ) {
    if (!rescheduleAppointmentAttrs.appointment) {
      throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {});
    }
    const rescheduleAppt = await this.findRescheduleRecord(rescheduleAppointmentAttrs.appointment);
    if (rescheduleAppt) {
      return rescheduleAppt;
    }
    const consultConn = getConnection('consults-db');
    const reshRepo = consultConn.getCustomRepository(RescheduleAppointmentRepository);
    const createReschdule = await reshRepo.saveReschedule(rescheduleAppointmentAttrs);

    // this.create(rescheduleAppointmentAttrs)
    //   .save()
    //   .catch((createErrors) => {
    //     console.log(createErrors, 'createErrors');
    //     throw new AphError(AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR, undefined, {
    //       createErrors,
    //     });
    //   });
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
    return createReschdule;
  }

  getRescheduleDetailsByAppointment(appointment: string) {
    return this.findOne({
      where: {
        appointment,
        rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
        rescheduleStatus: TRANSFER_STATUS.INITIATED,
      },
      order: { createdDate: 'DESC' },
    });
  }

  getRescheduleDetails(appointment: string) {
    return this.findOne({
      where: {
        appointment,
        rescheduleStatus: TRANSFER_STATUS.INITIATED,
      },
    });
  }

  getDoctorRescheduleDetailsByAppointment(appointment: string) {
    return this.find({
      where: {
        appointment,
        rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
        rescheduleStatus: TRANSFER_STATUS.INITIATED,
      },
    });
  }

  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointment: appointmentId } });
  }
}
