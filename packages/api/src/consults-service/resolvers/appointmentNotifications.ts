import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  sendReminderNotification,
  NotificationType,
  sendNotification,
  DOCTOR_CALL_TYPE,
} from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
import { format, subMinutes, addMinutes } from 'date-fns';
import { AppointmentNoShowRepository } from 'consults-service/repositories/appointmentNoShowRepository';
import { APPOINTMENT_STATE } from 'consults-service/entities';
import { DoctorType } from 'doctors-service/entities';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';

import {
  CASESHEET_STATUS,
  APPOINTMENT_TYPE,
  TRANSFER_STATUS,
  AppointmentNoShow,
  STATUS,
  REQUEST_ROLES,
  TRANSFER_INITIATED_TYPE,
} from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';

export const appointmentNotificationTypeDefs = gql`
  type ApptReminderResult {
    status: Boolean
    currentTime: String
    apptsListCount: Int
  }

  type noShowReminder {
    status: Boolean
    apptsListCount: Int
    noCaseSheetCount: Int
  }

  extend type Query {
    sendApptReminderNotification(inNextMin: Int): ApptReminderResult!
    sendPhysicalApptReminderNotification(inNextMin: Int): ApptReminderResult!
    noShowReminderNotification: noShowReminder!
    autoSubmitJDCasesheet: String
  }
`;

type ApptReminderResult = {
  status: boolean;
  currentTime: string;
  apptsListCount: number;
};

type noShowReminder = {
  status: boolean;
  apptsListCount: number;
  noCaseSheetCount: number;
};

const autoSubmitJDCasesheet: Resolver<null, {}, ConsultServiceContext, String> = async (
  parent,
  args,
  { consultsDb, doctorsDb, patientsDb }
) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const ConsultQueueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);

  const currentDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:00.000X");
  const futureTime = addMinutes(new Date(currentDate), 10);
  const appointments = await apptRepo.getAppointmentsByDate(futureTime);
  const appointmentIds = appointments.map((appointment) => appointment.id);

  if (appointmentIds.length) {
    const caseSheets = await caseSheetRepo.getJDCaseSheetsByAppointmentId(appointmentIds);
    const attendedAppointmentIds = caseSheets.map((casesheet) => casesheet.appointment.id);
    const unAttendedAppointmentIds = appointmentIds.filter(
      (id) => !attendedAppointmentIds.includes(id)
    );

    if (unAttendedAppointmentIds.length) {
      const unAttendedAppointments = appointments.filter((appointment) =>
        unAttendedAppointmentIds.includes(appointment.id)
      );
      const virtualJDId = process.env.VIRTUAL_JD_ID;
      const createdDate = new Date();

      //adding or updating consult queue items
      const consultQueueAttrs = unAttendedAppointments.map((appointment) => {
        return {
          appointmentId: appointment.id,
          createdDate: createdDate,
          doctorId: virtualJDId,
          isActive: false,
        };
      });
      const queueItems = await ConsultQueueRepo.getQueueItemsByAppointmentId(
        unAttendedAppointmentIds
      );
      const activequeueItemIds = queueItems.map((queueItem) => queueItem.consultQueueItem_id);
      if (activequeueItemIds.length)
        ConsultQueueRepo.updateConsultQueueItems(activequeueItemIds, virtualJDId);
      const activequeueItemAppointmentIds = queueItems.map(
        (queueItem) => queueItem.consultQueueItem_appointmentId
      );
      const queueItemsToBeAdded = consultQueueAttrs.filter(
        (consultQueueAttr) =>
          !activequeueItemAppointmentIds.includes(consultQueueAttr.appointmentId)
      );
      if (queueItemsToBeAdded.length) ConsultQueueRepo.saveConsultQueueItems(queueItemsToBeAdded);

      //adding case sheets
      const casesheetAttrs = unAttendedAppointments.map((appointment) => {
        return {
          createdDate: createdDate,
          consultType: APPOINTMENT_TYPE.ONLINE,
          createdDoctorId: process.env.VIRTUAL_JD_ID,
          doctorType: DoctorType.JUNIOR,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          appointment: appointment,
          status: CASESHEET_STATUS.COMPLETED,
          notes: activequeueItemAppointmentIds.includes(appointment.id)
            ? ApiConstants.VIRTUAL_JD_NOTES_ASSIGNED.toString()
            : ApiConstants.VIRTUAL_JD_NOTES_UNASSIGNED.toString(),
        };
      });
      caseSheetRepo.saveMultipleCaseSheets(casesheetAttrs);

      //updating appointments
      apptRepo.updateJdQuestionStatusbyIds(unAttendedAppointmentIds);
    }
  }

  return ApiConstants.AUTO_SUBMIT_JD_CASESHEET_RESPONSE.toString();
};

const sendApptReminderNotification: Resolver<
  null,
  { inNextMin: number },
  ConsultServiceContext,
  ApptReminderResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptsList = await apptRepo.getSpecificMinuteAppointments(
    args.inNextMin,
    APPOINTMENT_TYPE.ONLINE
  );
  console.log(apptsList);
  if (apptsList.length > 0) {
    apptsList.map((appt) => {
      const pushNotificationInput = {
        appointmentId: appt.id,
        notificationType: NotificationType.APPOINTMENT_REMINDER_15,
        doctorNotification: true,
      };
      if (args.inNextMin != 1) {
        if (appt.caseSheet.length > 0) {
          if (
            appt.caseSheet[0].status == CASESHEET_STATUS.PENDING &&
            appt.caseSheet[0].doctorType == 'JUNIOR'
          ) {
            pushNotificationInput.notificationType =
              NotificationType.APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL;
          } else if (
            appt.caseSheet[0].status == CASESHEET_STATUS.COMPLETED &&
            appt.caseSheet[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR.toString() &&
            args.inNextMin == 15
          ) {
            pushNotificationInput.notificationType = NotificationType.VIRTUAL_REMINDER_15;
          }
        }
        if (appt.caseSheet.length == 0) {
          pushNotificationInput.notificationType =
            NotificationType.APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL;
        }
        if (args.inNextMin == 5) {
          pushNotificationInput.doctorNotification = false;
        }
      }
      if (
        !(
          args.inNextMin == 5 &&
          pushNotificationInput.notificationType == NotificationType.APPOINTMENT_REMINDER_15
        )
      ) {
        sendReminderNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
      }
    });
  }

  return {
    status: true,
    currentTime: format(new Date(), 'yyyy-MM-dd hh:mm'),
    apptsListCount: apptsList.length,
  };
};

const sendPhysicalApptReminderNotification: Resolver<
  null,
  { inNextMin: number },
  ConsultServiceContext,
  ApptReminderResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptsList = await apptRepo.getSpecificMinuteAppointments(
    args.inNextMin,
    APPOINTMENT_TYPE.PHYSICAL
  );
  console.log(apptsList);
  if (apptsList.length > 0) {
    apptsList.map((appt) => {
      const pushNotificationInput = {
        appointmentId: appt.id,
        notificationType: NotificationType.APPOINTMENT_REMINDER_15,
      };
      if (args.inNextMin != 15) {
        if (args.inNextMin == 1) {
          pushNotificationInput.notificationType = NotificationType.PHYSICAL_APPT_1;
        } else if (appt.caseSheet.length > 0) {
          if (
            appt.caseSheet[0].status == CASESHEET_STATUS.PENDING &&
            appt.caseSheet[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR.toString()
          ) {
            pushNotificationInput.notificationType =
              NotificationType.APPOINTMENT_CASESHEET_REMINDER_15;
          } else if (
            appt.caseSheet[0].status == CASESHEET_STATUS.COMPLETED &&
            appt.caseSheet[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR.toString() &&
            args.inNextMin == 59
          ) {
            pushNotificationInput.notificationType = NotificationType.PHYSICAL_APPT_60;
          } else if (
            appt.caseSheet[0].status == CASESHEET_STATUS.COMPLETED &&
            appt.caseSheet[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR.toString() &&
            args.inNextMin == 179
          ) {
            pushNotificationInput.notificationType = NotificationType.PHYSICAL_APPT_180;
          }
        } else if (appt.caseSheet.length == 0) {
          pushNotificationInput.notificationType =
            NotificationType.APPOINTMENT_CASESHEET_REMINDER_15;
        }
      }

      const notificationResult = sendReminderNotification(
        pushNotificationInput,
        patientsDb,
        consultsDb,
        doctorsDb
      );
      console.log(notificationResult, 'appt notification');
    });
  }

  return {
    status: true,
    currentTime: format(new Date(), 'yyyy-MM-dd hh:mm'),
    apptsListCount: apptsList.length,
  };
};

const noShowReminderNotification: Resolver<
  null,
  {},
  ConsultServiceContext,
  noShowReminder
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const date = format(new Date(), "yyyy-MM-dd'T'HH:mm:00.000X");
  const apptsrepo = consultsDb.getCustomRepository(AppointmentRepository);

  const appointments = await apptsrepo.getAppointmentsByDate(subMinutes(new Date(date), 3));
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const rescheduleRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
  const noShowRepo = consultsDb.getCustomRepository(AppointmentNoShowRepository);
  let noCaseSheet = 0;
  if (appointments.length) {
    appointments.forEach(async (appt) => {
      const caseSheetDetails = await caseSheetRepo.getCompletedCaseSheetsByAppointmentId(appt.id);
      if (caseSheetDetails.length === 0) {
        noCaseSheet++;
        const rescheduleAppointmentAttrs = {
          appointmentId: appt.id,
          rescheduleReason: ApiConstants.PATIENT_NOSHOW_REASON.toString(),
          rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
          rescheduleInitiatedId: appt.patientId,
          autoSelectSlot: 0,
          rescheduledDateTime: new Date(),
          rescheduleStatus: TRANSFER_STATUS.INITIATED,
          appointment: appt,
        };
        const reschDetails = await rescheduleRepo.findRescheduleRecord(appt);
        if (reschDetails) {
          console.log('appointment reschedule record exists', appt.id);
        } else {
          await rescheduleRepo.saveReschedule(rescheduleAppointmentAttrs);
          const noShowAttrs: Partial<AppointmentNoShow> = {
            noShowType: REQUEST_ROLES.PATIENT,
            appointment: appt,
            noShowStatus: STATUS.NO_SHOW,
          };
          await apptsrepo.updateTransferState(appt.id, APPOINTMENT_STATE.AWAITING_RESCHEDULE);

          await apptsrepo.updateAppointmentStatus(appt.id, STATUS.NO_SHOW, true);

          await noShowRepo.saveNoShow(noShowAttrs);
        }
        const pushNotificationInput = {
          appointmentId: rescheduleAppointmentAttrs.appointment.id,
          notificationType: NotificationType.PATIENT_NO_SHOW,
        };
        const notificationResult = sendNotification(
          pushNotificationInput,
          patientsDb,
          consultsDb,
          doctorsDb
        );
        console.log(notificationResult, 'notificationResult');
      }
    });
  }
  return {
    status: true,
    apptsListCount: appointments.length,
    noCaseSheetCount: noCaseSheet,
  };
};

export const appointmentNotificationResolvers = {
  Query: {
    sendApptReminderNotification,
    noShowReminderNotification,
    sendPhysicalApptReminderNotification,
    autoSubmitJDCasesheet,
  },
};
