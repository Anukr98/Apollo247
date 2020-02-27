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
import { format, subMinutes } from 'date-fns';
import { AppointmentNoShowRepository } from 'consults-service/repositories/appointmentNoShowRepository';
import { APPOINTMENT_STATE } from 'consults-service/entities';

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
      };
      if (appt.caseSheet.length > 0) {
        if (
          appt.caseSheet[0].status == CASESHEET_STATUS.PENDING &&
          appt.caseSheet[0].doctorType == 'JUNIOR'
        ) {
          pushNotificationInput.notificationType =
            NotificationType.APPOINTMENT_CASESHEET_REMINDER_15;
        }
      }
      if (appt.caseSheet.length == 0) {
        pushNotificationInput.notificationType = NotificationType.APPOINTMENT_CASESHEET_REMINDER_15;
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
            args.inNextMin == 180
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
  },
};
