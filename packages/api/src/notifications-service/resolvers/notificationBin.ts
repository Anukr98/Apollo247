import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import {
  notificationEventName,
  notificationStatus,
  notificationType,
  NotificationBin,
} from 'consults-service/entities';
import { NotificationBinRepository } from 'notifications-service/repositories/notificationBinRepository';

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

  extend type Mutation {
    insertMessage(messageInput: MessageInput): NotificationData
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
  const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
  const notificationInputs: Partial<NotificationBin> = {
    fromId: messageInput.fromId,
    toId: messageInput.toId,
    eventName: messageInput.eventName,
    eventId: messageInput.eventId,
    message: messageInput.message,
    status: messageInput.status,
    type: messageInput.type,
  };
  await notificationBinRepo.saveNotification(notificationInputs);

  return { notificationData: notificationInputs };
};

export const notificationBinResolvers = {
  Mutation: {
    insertMessage,
  },
};
