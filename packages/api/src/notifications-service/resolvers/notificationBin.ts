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
import { sendNotificationSMS } from 'notifications-service/resolvers/notifications';

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

  extend type Query {
    getNotifications(toId: String!): [NotificationBinData]
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
> = async (parent, { messageInput }, { consultsDb }) => {
  const { fromId, toId, eventName, eventId, message, status, type } = messageInput;
  const bytes = CryptoJS.AES.decrypt(message, process.env.NOTIFICATION_SMS_SECRECT_KEY);
  const isMessageEncrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!isMessageEncrypted) throw new AphError(AphErrorMessages.MESSAGE_ENCRYPTION_ERROR);
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
  if (eventName == notificationEventName.APPOINTMENT) {
  }
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

const getNotifications: Resolver<
  null,
  { toId: string; startDate: Date; endDate: Date },
  NotificationsServiceContext,
  { notificationData: Partial<NotificationBin>[] }
> = async (parent, args, { consultsDb }) => {
  const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
  const notificationData = await notificationBinRepo.getNotificationInTimePeriod(
    args.toId,
    args.startDate,
    args.endDate
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
  },
};
