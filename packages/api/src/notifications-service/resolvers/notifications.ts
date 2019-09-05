import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import * as firebaseAdmin from 'firebase-admin';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getNotificationsTypeDefs = gql`
  type PushNotificationMessage {
    messageId: String
  }

  type PushNotificationSuccessMessaage {
    results: [PushNotificationMessage]
    canonicalRegistrationTokenCount: Int
    failureCount: Int
    successCount: Int
    multicastId: Int
  }

  enum NotificationPriority {
    high
    normal
  }

  input PushNotificationInput {
    title: String
    body: String
    priority: NotificationPriority
    registrationToken: String
  }

  extend type Query {
    sendPushNotification(
      pushNotificationInput: PushNotificationInput
    ): PushNotificationSuccessMessaage
  }
`;

type PushNotificationMessage = {
  messageId: string;
};

export type PushNotificationSuccessMessaage = {
  results: PushNotificationMessage[];
  canonicalRegistrationTokenCount: number;
  failureCount: number;
  successCount: number;
  multicastId: number;
};

export enum NotificationPriority {
  high = 'high',
  normal = 'normal',
}

type PushNotificationInput = {
  title: string;
  body: string;
  priority: NotificationPriority;
  registrationToken: string;
};

type PushNotificationInputArgs = { pushNotificationInput: PushNotificationInput };

export async function sendNotification(pushNotificationInput: PushNotificationInput) {
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  const payload = {
    notification: {
      title: pushNotificationInput.title,
      body: pushNotificationInput.body,
    },
  };

  const options = {
    priority: pushNotificationInput.priority,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  let notificationResponse;
  const registrationToken = pushNotificationInput.registrationToken;
  await admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationMessage) => {
      notificationResponse = response;
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  return notificationResponse;
}

const sendPushNotification: Resolver<
  null,
  PushNotificationInputArgs,
  {},
  PushNotificationSuccessMessaage | undefined
> = async (parent, { pushNotificationInput }, {}) => {
  return sendNotification(pushNotificationInput);
};
export const getNotificationsResolvers = {
  Query: { sendPushNotification },
};
