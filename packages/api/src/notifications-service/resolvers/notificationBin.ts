import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import {
  notificationEventName,
  notificationStatus,
  notificationType,
  NotificationBin,
  NotificationBinArchive,
  STATUS,
} from 'consults-service/entities';
import {
  NotificationBinRepository,
  NotificationBinArchiveRepository,
} from 'notifications-service/repositories/notificationBinRepository';
import CryptoJS from 'crypto-js';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { subDays, format, differenceInDays, addMinutes } from 'date-fns';
import { ApiConstants } from 'ApiConstants';
import { sendNotificationSMS } from 'notifications-service/resolvers/notifications';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { sendChatMessageNotification } from 'notifications-service/resolvers/notifications';

export const notificationBinTypeDefs = gql`
  enum notificationStatus {
    READ
    UNREAD
  }

  enum notificationEventName {
    APPOINTMENT
  }

  enum notificationType {
    CHAT
  }

  input MessageInput {
    fromId: String!
    toId: String!
    eventName: notificationEventName!
    eventId: String!
    message: String!
    status: notificationStatus!
    type: notificationType!
  }

  type NotificationBinData {
    fromId: String!
    toId: String!
    eventName: notificationEventName!
    eventId: String!
    message: String!
    status: notificationStatus!
    type: notificationType!
    id: String
  }

  type NotificationData {
    notificationData: NotificationBinData
  }

  type NotificationDataSet {
    notificationData: [GetNotificationsResponse]
  }

  type NotificationBinDataSet {
    notificationData: [NotificationBinData]
  }

  type GetNotificationsResponse {
    appointmentId: String
    doctorId: String
    lastUnreadMessageDate: DateTime
    patientId: String
    patientFirstName: String
    patientLastName: String
    patientPhotoUrl: String
    unreadNotificationsCount: Int
  }

  extend type Query {
    getNotifications(toId: String!, startDate: Date, endDate: Date): NotificationDataSet
    sendUnreadMessagesNotification: String
    archiveMessages: String
  }

  extend type Mutation {
    insertMessage(messageInput: MessageInput): NotificationData
    markMessageToUnread(eventId: String): NotificationBinDataSet
  }
`;

type MessageInput = {
  fromId: string;
  toId: string;
  eventName: notificationEventName;
  eventId: string;
  message: string;
  status: notificationStatus;
  type: notificationType;
};

type MessageInputArgs = {
  messageInput: MessageInput;
};

const insertMessage: Resolver<
  null,
  MessageInputArgs,
  NotificationsServiceContext,
  { notificationData: Partial<NotificationBin> }
> = async (parent, { messageInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const { fromId, toId, eventName, eventId, message, status, type } = messageInput;

  //checking for message encryption
  const bytes = CryptoJS.AES.decrypt(message, process.env.NOTIFICATION_SMS_SECRECT_KEY);
  const isMessageEncrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!isMessageEncrypted) throw new AphError(AphErrorMessages.MESSAGE_ENCRYPTION_ERROR);

  let messageBody = '';
  let mobileNumber = '';

  if (eventName == notificationEventName.APPOINTMENT) {
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);

    //get doctor details
    const doctorDetails = await doctorRepo.findDoctorByIdWithoutRelations(toId);
    if (!doctorDetails) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
    mobileNumber = doctorDetails.mobileNumber;

    //get patient details
    const patientRepo = patientsDb.getCustomRepository(PatientRepository);
    const patientDetails = await patientRepo.getPatientDetails(fromId);
    if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

    //get appointment details
    const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
    const appointmentData = await appointmentRepo.findById(messageInput.eventId);
    if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

    if (appointmentData.status != STATUS.COMPLETED)
      throw new AphError(AphErrorMessages.APPOINTMENT_NOT_COMPLETED);

    const today = format(new Date(), 'yyyy-MM-dd');
    const consultDate = format(appointmentData.sdConsultationDate, 'yyyy-MM-dd');
    const difference = differenceInDays(new Date(today), new Date(consultDate));

    if (difference > parseInt(ApiConstants.FREE_CHAT_DAYS.toString(), 10))
      throw new AphError(AphErrorMessages.FREE_CHAT_DAYS_COMPLETED);

    //create message body
    messageBody = ApiConstants.CHAT_MESSGAE_TEXT.replace('{0}', doctorDetails.firstName).replace(
      '{1}',
      patientDetails.firstName
    );
    sendChatMessageNotification(doctorDetails, patientDetails, appointmentData, doctorsDb, '');
  }
  const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
  const notificationInputs: Partial<NotificationBin> = {
    fromId: fromId,
    toId: toId,
    eventName: eventName,
    eventId: eventId,
    message: message,
    status: status,
    type: type,
  };
  const notificationData = await notificationBinRepo.saveNotification(notificationInputs);

  //sending sms to doctor after data is saved successfully in notificationBin
  if (mobileNumber && messageBody) sendNotificationSMS(mobileNumber, messageBody);

  return { notificationData: notificationData };
};

const markMessageToUnread: Resolver<
  null,
  { eventId: string },
  NotificationsServiceContext,
  { notificationData: Partial<NotificationBinArchive>[] }
> = async (parent, args, { consultsDb }) => {
  const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
  const notificationData = await notificationBinRepo.getNotificationByEventId(args.eventId);
  if (notificationData == null || notificationData.length == 0)
    throw new AphError(AphErrorMessages.INVALID_EVENT_ID);

  const dataToArchieve: Partial<NotificationBinArchive>[] = notificationData.map((notification) => {
    const notificationBinData: Partial<NotificationBinArchive> = { ...notification };
    notificationBinData.status = notificationStatus.READ;
    delete notificationBinData.id;
    delete notificationBinData.createdDate;
    delete notificationBinData.updatedDate;
    return notificationBinData;
  });

  const notificationArchieveBinRepo = consultsDb.getCustomRepository(
    NotificationBinArchiveRepository
  );
  const archievedNotificationData = await notificationArchieveBinRepo.saveNotification(
    dataToArchieve
  );
  await notificationBinRepo.removeNotificationByEventId(args.eventId);

  return { notificationData: archievedNotificationData };
};

const sendUnreadMessagesNotification: Resolver<
  null,
  {},
  NotificationsServiceContext,
  String
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);

  //get all the available doctor details
  const doctors = await doctorRepo.getAllSeniorDoctors();
  const doctorIds = doctors.map((doctor) => doctor.id);

  //getting all the un-read notifications
  const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
  const notifications = await notificationBinRepo.getAllNotificationsByDoctorIds(doctorIds);

  //Filter the unique notifications with respect to appointments
  const uniqueAppointmentNotifications: { [key: string]: Partial<NotificationBin> } = {};
  notifications.map((notification) => {
    const appointmentId = notification.eventId;
    uniqueAppointmentNotifications[appointmentId] = notification;
  });

  //Generate the unique notifications array
  const uniqueNotifications: Partial<NotificationBin>[] = [];
  const appointmentIds: string[] = [];
  Object.keys(uniqueAppointmentNotifications).map((appointmentId) => {
    uniqueNotifications.push(uniqueAppointmentNotifications[appointmentId]);
    appointmentIds.push(appointmentId);
  });

  if (appointmentIds.length) {
    //Getting the appointments data of uniqueAppointmentNotifications
    const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
    const appointmentsData = await appointmentRepo.getAppointmentsByIdsWithSpecificFields(
      appointmentIds,
      ['appointment.doctorId', 'appointment.sdConsultationDate']
    );

    //Filtering the last date appointments
    const lastDayAppointments = appointmentsData.filter((appointment) => {
      if (!appointment.sdConsultationDate) return false;
      const today = format(new Date(), 'yyyy-MM-dd');
      const consultDate = format(appointment.sdConsultationDate, 'yyyy-MM-dd');
      const difference = differenceInDays(new Date(today), new Date(consultDate));
      return difference == parseInt(ApiConstants.FREE_CHAT_DAYS.toString(), 10) - 1;
    });

    //Mapping the doctor ids with count of last day appointments
    const lastDayAppointmentsCount: { [key: string]: number } = {};
    lastDayAppointments.map((appointment) => {
      if (lastDayAppointmentsCount[appointment.doctorId]) {
        lastDayAppointmentsCount[appointment.doctorId] =
          lastDayAppointmentsCount[appointment.doctorId] + 1;
      } else {
        lastDayAppointmentsCount[appointment.doctorId] = 1;
      }
    });

    //Get the Notifications count for each doctor
    const notificationsCount: { [key: string]: number } = {};
    const doctorIdsToSendNotification: string[] = [];
    uniqueNotifications.map((notification) => {
      if (notification.toId) {
        if (notificationsCount[notification.toId]) {
          notificationsCount[notification.toId] = notificationsCount[notification.toId] + 1;
        } else {
          doctorIdsToSendNotification.push(notification.toId);
          notificationsCount[notification.toId] = 1;
        }
      }
    });

    //Filter the specific doctor details for which notification has to be sent
    const doctorDetails = doctors.filter((doctor) =>
      doctorIdsToSendNotification.includes(doctor.id)
    );

    //Mapping the doctor id and mobile number
    const doctorMobileMapper: { [key: string]: string[] } = {};
    doctorDetails.map((doctor) => {
      doctorMobileMapper[doctor.id] = [doctor.displayName, doctor.mobileNumber];
    });

    //Sending the Notification to doctors
    Object.keys(notificationsCount).map((doctorId) => {
      let messageBody = '';
      if (lastDayAppointmentsCount[doctorId]) {
        messageBody = ApiConstants.DOCTOR_CHAT_SMS_LAST_DAY.replace(
          '{0}',
          doctorMobileMapper[doctorId][0].toString()
        )
          .replace('{1}', notificationsCount[doctorId].toString())
          .replace('{2}', lastDayAppointmentsCount[doctorId].toString());
      } else {
        messageBody = ApiConstants.DOCTOR_CHAT_SMS_TEXT.replace(
          '{0}',
          doctorMobileMapper[doctorId][0].toString()
        ).replace('{1}', notificationsCount[doctorId].toString());
      }
      sendNotificationSMS(doctorMobileMapper[doctorId][1], messageBody);
    });
  }

  return 'success';
};

const archiveMessages: Resolver<null, {}, NotificationsServiceContext, String> = async (
  parent,
  args,
  { consultsDb }
) => {
  //Getting all the appointments past 1 day of free chat days
  const currentIstDate = addMinutes(new Date(), 330); //Taking IST time
  const appointmentDateToBeArchived = subDays(currentIstDate, ApiConstants.FREE_CHAT_DAYS);
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointments = await appointmentRepo.getAllCompletedAppointmentsByConsultTime(
    appointmentDateToBeArchived
  );
  const appointmentIdsToBeArchived = appointments.map((appointment) => appointment.id);

  if (appointmentIdsToBeArchived.length) {
    //Getting the Notifications which needs to be archived
    const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
    const notificationsToBeArchived = await notificationBinRepo.getAllNotificationsByAppointmentIds(
      appointmentIdsToBeArchived
    );
    const idsToBeDeleted: string[] = [];
    const dataToArchieve: Partial<NotificationBinArchive>[] = notificationsToBeArchived.map(
      (notification) => {
        const notificationBinData: Partial<NotificationBinArchive> = { ...notification };
        notificationBinData.status = notificationStatus.READ;
        if (notificationBinData.id) idsToBeDeleted.push(notificationBinData.id);
        delete notificationBinData.id;
        delete notificationBinData.createdDate;
        delete notificationBinData.updatedDate;
        return notificationBinData;
      }
    );

    if (dataToArchieve.length) {
      //Copying the notifications to notification bin archive Table
      const notificationArchieveBinRepo = consultsDb.getCustomRepository(
        NotificationBinArchiveRepository
      );
      await notificationArchieveBinRepo.saveNotification(dataToArchieve);

      //Deleting the moved notifications
      await notificationBinRepo.removeNotificationByIds(idsToBeDeleted);
    }
  }

  return 'success';
};

type GetNotificationsResponse = {
  appointmentId: string;
  doctorId: string;
  lastUnreadMessageDate: Date;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhotoUrl: string;
  unreadNotificationsCount: number;
};

const getNotifications: Resolver<
  null,
  { toId: string; startDate: Date; endDate: Date },
  NotificationsServiceContext,
  { notificationData: GetNotificationsResponse[] }
> = async (parent, args, { consultsDb, patientsDb, doctorsDb }) => {
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorDetails = await doctorRepo.findDoctorByIdWithoutRelations(args.toId);
  if (!doctorDetails) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

  const startDate =
    args.startDate && args.endDate
      ? args.startDate
      : subDays(new Date(), ApiConstants.FREE_CHAT_DAYS);
  const endDate = args.startDate && args.endDate ? args.endDate : new Date();
  const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
  const notificationData = await notificationBinRepo.getNotificationInTimePeriod(
    args.toId,
    startDate,
    endDate
  );
  if (!notificationData.length) return { notificationData: [] };

  //Mapping the appoint id with respect to response object
  const appointmentIds: string[] = [];
  const patientIds: string[] = [];
  const appointmentPatientIdMapper: { [key: string]: string } = {};
  const appointmentLastUnreadMessageDateMapper: { [key: string]: Date } = {};
  const appointmentUnreadMessageCountMapper: { [key: string]: number } = {};
  notificationData.forEach((notification) => {
    if (!appointmentIds.includes(notification.eventId)) {
      appointmentIds.push(notification.eventId);
      appointmentUnreadMessageCountMapper[notification.eventId] = 1;
    } else {
      appointmentUnreadMessageCountMapper[notification.eventId]++;
    }

    appointmentPatientIdMapper[notification.eventId] = notification.fromId;
    appointmentLastUnreadMessageDateMapper[notification.eventId] = notification.createdDate;

    if (!patientIds.includes(notification.fromId)) {
      patientIds.push(notification.fromId);
    }
  });

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientsData = await patientRepo.findPatientDetailsByIdsAndFields(patientIds, [
    'patient.id',
    'patient.photoUrl',
    'patient.firstName',
    'patient.lastName',
  ]);

  //Mapping patient id with patient details
  const patientFirstNameMapper: { [key: string]: string } = {};
  const patientLastNameMapper: { [key: string]: string } = {};
  const patientPhotoMapper: { [key: string]: string } = {};

  patientsData.forEach((patient) => {
    patientFirstNameMapper[patient.id] = patient.firstName;
    patientLastNameMapper[patient.id] = patient.lastName;
    patientPhotoMapper[patient.id] = patient.photoUrl;
  });

  //Generating the response object
  const response = appointmentIds.map((appointmentId) => {
    return {
      appointmentId,
      doctorId: args.toId,
      lastUnreadMessageDate: appointmentLastUnreadMessageDateMapper[appointmentId],
      patientId: appointmentPatientIdMapper[appointmentId],
      patientFirstName: patientFirstNameMapper[appointmentPatientIdMapper[appointmentId]],
      patientLastName: patientLastNameMapper[appointmentPatientIdMapper[appointmentId]],
      patientPhotoUrl: patientPhotoMapper[appointmentPatientIdMapper[appointmentId]],
      unreadNotificationsCount: appointmentUnreadMessageCountMapper[appointmentId],
    };
  });

  return { notificationData: response };
};

export const notificationBinResolvers = {
  Mutation: {
    insertMessage,
    markMessageToUnread,
  },
  Query: {
    getNotifications,
    sendUnreadMessagesNotification,
    archiveMessages,
  },
};
