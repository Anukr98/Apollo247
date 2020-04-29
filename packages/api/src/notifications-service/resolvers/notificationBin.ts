import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import {
  notificationEventName,
  notificationStatus,
  notificationType,
  NotificationBin,
  NotificationBinArchive,
} from 'consults-service/entities';
import {
  NotificationBinRepository,
  NotificationBinArchiveRepository,
} from 'notifications-service/repositories/notificationBinRepository';
import CryptoJS from 'crypto-js';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { subDays } from 'date-fns';
import { ApiConstants } from 'ApiConstants';
import { sendNotificationSMS } from 'notifications-service/resolvers/notifications';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

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
  }

  type NotificationData {
    notificationData: NotificationBinData
  }

  type NotificationDataSet {
    notificationData: [NotificationBinData]
  }

  extend type Query {
    getNotifications(toId: String!, startDate: Date, endDate: Date): NotificationDataSet
    sendUnreadMessagesNotification: String
  }

  extend type Mutation {
    insertMessage(messageInput: MessageInput): NotificationData
    markMessageToUnread(messageId: String): NotificationData
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

    const patientRepo = patientsDb.getCustomRepository(PatientRepository);

    //get patient details
    const patientDetails = await patientRepo.findById(fromId);
    if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

    //create message body
    messageBody = ApiConstants.CHAT_MESSGAE_TEXT.replace('{0}', doctorDetails.firstName).replace(
      '{1}',
      patientDetails.firstName
    );
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
  { messageId: string },
  NotificationsServiceContext,
  { notificationData: Partial<NotificationBinArchive> }
> = async (parent, args, { consultsDb }) => {
  const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
  const notificationData = await notificationBinRepo.getNotificationById(args.messageId);
  if (notificationData == null) throw new AphError(AphErrorMessages.INVALID_MESSAGE_ID);

  const dataToArchieve = { ...notificationData };
  dataToArchieve.status = notificationStatus.READ;
  delete dataToArchieve.id;
  delete dataToArchieve.createdDate;
  delete dataToArchieve.updatedDate;

  const notificationArchieveBinRepo = consultsDb.getCustomRepository(
    NotificationBinArchiveRepository
  );
  const archievedNotificationData = await notificationArchieveBinRepo.saveNotification(
    dataToArchieve
  );
  await notificationBinRepo.removeNotification(args.messageId);

  return { notificationData: archievedNotificationData };
};

type Notifications = {
  doctor: string;
  patient: string;
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
  console.log('notificationData==', notifications);

  const doctorAndPatient: Notifications[] = [];
  const doctorAndPatientMapper: string[] = [];


  notifications.map((notification) => {
    if(doctorAndPatient[])
  })

  // const notificationsCount: { [key: string]: number } = {};
  // const doctorMobileMapper: { [key: string]: string } = {};
  // const doctorIdsToSendNotification: string[] = [];
  // notifications.map((notification) => {
  //   console.log(notification.doctor);
  //   if (notification.doctor) {
  //     if (notificationsCount[notification.doctor]) {
  //       notificationsCount[notification.doctor] = notificationsCount[notification.doctor] + 1;
  //     } else {
  //       doctorIdsToSendNotification.push(notification.doctor);
  //       notificationsCount[notification.doctor] = 1;
  //     }
  //   }
  // });
  // console.log('notificationsCount==', notificationsCount);
  // console.log('doctorIdsToSendNotification==', doctorIdsToSendNotification);

  // const doctorDetails = await doctorRepo.getDoctorDetailsByIds(doctorIdsToSendNotification);
  // console.log('doctorDetails==', doctorDetails);

  // doctorDetails.map((doctor) => {
  //   doctorMobileMapper[doctor.id] = doctor.mobileNumber;
  // });
  // console.log('doctorMobileMapper==', doctorMobileMapper);

  // Object.keys(notificationsCount).map((doctorId) => {
  //   const messageBody = ApiConstants.DOCTOR_CHAT_SMS_TEXT.replace(
  //     '{0}',
  //     notificationsCount[doctorId].toString()
  //   );
  //   console.log('messageBody==', messageBody);
  //   sendNotificationSMS(doctorMobileMapper[doctorId], messageBody);
  // });

  return 'success';
};

const getNotifications: Resolver<
  null,
  { toId: string; startDate: Date; endDate: Date },
  NotificationsServiceContext,
  { notificationData: Partial<NotificationBin>[] }
> = async (parent, args, { consultsDb }) => {
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

  return { notificationData: notificationData };
};

export const notificationBinResolvers = {
  Mutation: {
    insertMessage,
    markMessageToUnread,
  },
  Query: {
    getNotifications,
    sendUnreadMessagesNotification,
  },
};
