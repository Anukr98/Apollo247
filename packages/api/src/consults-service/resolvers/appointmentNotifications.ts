import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  sendReminderNotification,
  NotificationType,
} from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
import { format, subMinutes } from 'date-fns';
import { AppointmentNoShowRepository } from 'consults-service/repositories/appointmentNoShowRepository';

import {
  CASESHEET_STATUS,
  APPOINTMENT_TYPE,
  TRANSFER_STATUS,
  AppointmentNoShow,
  STATUS,
  REQUEST_ROLES,
  TRANSFER_INITIATED_TYPE,
} from 'consults-service/entities';

export const appointmentNotificationTypeDefs = gql`
  type ApptReminderResult {
    status: Boolean
    currentTime: String
    apptsListCount: Int
  }

  type noShowReminder {
    status: Boolean
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
      if (args.inNextMin == 1) {
        pushNotificationInput.notificationType = NotificationType.PHYSICAL_APPT_1;
      } else if (args.inNextMin == 59) {
        pushNotificationInput.notificationType = NotificationType.PHYSICAL_APPT_60;
      } else if (appt.caseSheet.length > 0) {
        if (
          appt.caseSheet[0].status == CASESHEET_STATUS.PENDING &&
          appt.caseSheet[0].doctorType == 'JUNIOR'
        ) {
          pushNotificationInput.notificationType =
            NotificationType.APPOINTMENT_CASESHEET_REMINDER_15;
        }
      } else if (appt.caseSheet.length == 0) {
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
  if (appointments.length) {
    appointments.forEach(async (appt) => {
      const caseSheetDetails = await caseSheetRepo.getCaseSheetByAppointmentId(appt.id);
      if (caseSheetDetails.length === 0) {
        const rescheduleAppointmentAttrs = {
          appointmentId: appt.id,
          rescheduleReason: '',
          rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
          rescheduleInitiatedId: appt.patientId,
          autoSelectSlot: 0,
          rescheduledDateTime: new Date(),
          rescheduleStatus: TRANSFER_STATUS.INITIATED,
          appointment: appt,
        };
        await rescheduleRepo.rescheduleAppointment(
          rescheduleAppointmentAttrs,
          consultsDb,
          doctorsDb,
          patientsDb
        );
        const noShowAttrs: Partial<AppointmentNoShow> = {
          noShowType: REQUEST_ROLES.PATIENT,
          appointment: appt,
          noShowStatus: STATUS.NO_SHOW,
        };
        await noShowRepo.saveNoShow(noShowAttrs);
      }
    });
  }
  return {
    status: true,
  };
};

export const appointmentNotificationResolvers = {
  Query: {
    sendApptReminderNotification,
    noShowReminderNotification,
    sendPhysicalApptReminderNotification,
  },
};
