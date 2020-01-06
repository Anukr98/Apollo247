import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  sendReminderNotification,
  NotificationType,
} from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { format } from 'date-fns';
import { CASESHEET_STATUS, APPOINTMENT_TYPE } from 'consults-service/entities';

export const appointmentNotificationTypeDefs = gql`
  type ApptReminderResult {
    status: Boolean
    currentTime: DateTime
    apptsListCount: Int
  }

  extend type Query {
    sendApptReminderNotification(inNextMin: Int): ApptReminderResult!
    sendPhysicalApptReminderNotification(inNextMin: Int): ApptReminderResult!
  }
`;

type ApptReminderResult = {
  status: boolean;
  currentTime: string;
  apptsListCount: number;
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
      if (
        appt.caseSheet[0].status == CASESHEET_STATUS.PENDING &&
        appt.caseSheet[0].doctorType == 'JUNIOR'
      ) {
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
      if (
        appt.caseSheet[0].status == CASESHEET_STATUS.PENDING &&
        appt.caseSheet[0].doctorType == 'JUNIOR'
      ) {
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

export const appointmentNotificationResolvers = {
  Query: {
    sendApptReminderNotification,
    sendPhysicalApptReminderNotification,
  },
};
