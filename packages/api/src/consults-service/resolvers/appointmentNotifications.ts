import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  sendReminderNotification,
  NotificationType,
} from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { format, addMinutes } from 'date-fns';
import { DoctorType } from 'doctors-service/entities';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';

import { CASESHEET_STATUS, APPOINTMENT_TYPE, CaseSheet } from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';

export const appointmentNotificationTypeDefs = gql`
  type ApptReminderResult {
    status: Boolean
    currentTime: String
    apptsListCount: Int
  }

  extend type Query {
    sendApptReminderNotification(inNextMin: Int): ApptReminderResult!
    sendPhysicalApptReminderNotification(inNextMin: Int): ApptReminderResult!
    autoSubmitJDCasesheet: String
  }
`;

type ApptReminderResult = {
  status: boolean;
  currentTime: string;
  apptsListCount: number;
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
  const futureTime = addMinutes(
    new Date(currentDate),
    parseInt(ApiConstants.AUTO_SUBMIT_CASESHEET_TIME.toString(), 10)
  );
  const appointments = await apptRepo.getAllAppointmentsWithDate(futureTime);
  const appointmentIds = appointments.map((appointment) => appointment.id);

  if (appointmentIds.length) {
    const caseSheets = await caseSheetRepo.getJDCaseSheetsByAppointmentId(appointmentIds);
    const attendedAppointments: CaseSheet[] = [];
    const pendingCaseSheets: CaseSheet[] = [];
    caseSheets.forEach((casesheet) => {
      if (casesheet.isJdConsultStarted) {
        attendedAppointments.push(casesheet);
      } else {
        pendingCaseSheets.push(casesheet);
      }
    });
    const pendingAppointmentIds: string[] = [];
    const pendingCasesheetIds: string[] = [];
    pendingCaseSheets.forEach((casesheet) => {
      pendingAppointmentIds.push(casesheet.appointment.id);
      pendingCasesheetIds.push(casesheet.id);
    });
    const attendedAppointmentIds = attendedAppointments.map(
      (casesheet) => casesheet.appointment.id
    );
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

      const caseSheetsToBeAdded = unAttendedAppointments.filter(
        (appointment) => !pendingAppointmentIds.includes(appointment.id)
      );

      //adding case sheets
      const casesheetAttrsToAdd = caseSheetsToBeAdded.map((appointment) => {
        return {
          createdDate: createdDate,
          consultType: appointment.appointmentType,
          createdDoctorId: process.env.VIRTUAL_JD_ID,
          doctorType: DoctorType.JUNIOR,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          appointment: appointment,
          status: CASESHEET_STATUS.COMPLETED,
          notes: activequeueItemAppointmentIds.includes(appointment.id)
            ? ApiConstants.VIRTUAL_JD_NOTES_ASSIGNED.toString()
            : ApiConstants.VIRTUAL_JD_NOTES_UNASSIGNED.toString(),
          isJdConsultStarted: true,
        };
      });
      caseSheetRepo.saveMultipleCaseSheets(casesheetAttrsToAdd);

      //updating case sheets
      const casesheetAttrsToUpdate = {
        createdDoctorId: process.env.VIRTUAL_JD_ID,
        status: CASESHEET_STATUS.COMPLETED,
        notes: ApiConstants.VIRTUAL_JD_NOTES_ASSIGNED.toString(),
        isJdConsultStarted: true,
      };
      caseSheetRepo.updateMultipleCaseSheets(pendingCasesheetIds, casesheetAttrsToUpdate);

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
        if (args.inNextMin == 15) {
          pushNotificationInput.notificationType = NotificationType.VIRTUAL_REMINDER_15;
        }
        // if (!appt.isConsultStarted) {
        //   pushNotificationInput.notificationType =
        //        NotificationType.APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL;
        // }
        // if (appt.isConsultStarted) {
        //   if (args.inNextMin == 15) {
        //     pushNotificationInput.notificationType = NotificationType.VIRTUAL_REMINDER_15;
        //   }
        // } else {
        //   pushNotificationInput.notificationType =
        //     NotificationType.APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL;
        // }
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
        } else if (appt.isConsultStarted) {
          if (args.inNextMin == 59) {
            pushNotificationInput.notificationType = NotificationType.PHYSICAL_APPT_60;
          } else if (args.inNextMin == 179) {
            pushNotificationInput.notificationType = NotificationType.PHYSICAL_APPT_180;
          }
        } else {
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

export const appointmentNotificationResolvers = {
  Query: {
    sendApptReminderNotification,
    sendPhysicalApptReminderNotification,
    autoSubmitJDCasesheet,
  },
};
