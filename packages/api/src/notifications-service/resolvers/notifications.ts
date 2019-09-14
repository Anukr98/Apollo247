import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import * as firebaseAdmin from 'firebase-admin';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { Connection } from 'typeorm';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ApiConstants } from 'ApiConstants';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getNotificationsTypeDefs = gql`
  type PushNotificationMessage {
    messageId: String
  }

  type PushNotificationSuccessMessage {
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

  enum NotificationType {
    INITIATE_RESCHEDULE
    INITIATE_TRANSFER
  }

  input PushNotificationInput {
    notificationType: NotificationType
    appointmentId: String
  }

  extend type Query {
    sendPushNotification(
      pushNotificationInput: PushNotificationInput
    ): PushNotificationSuccessMessage
  }
`;

type PushNotificationMessage = {
  messageId: string;
};

export type PushNotificationSuccessMessage = {
  results: PushNotificationMessage[];
  canonicalRegistrationTokenCount: number;
  failureCount: number;
  successCount: number;
  multicastId: number;
};

export enum NotificationType {
  INITIATE_RESCHEDULE = 'INITIATE_RESCHEDULE',
  INITIATE_TRANSFER = 'INITIATE_TRANSFER',
  INITIATE_JUNIOR_APPT_SESSION = 'INITIATE_JUNIOR_APPT_SESSION',
  INITIATE_SENIOR_APPT_SESSION = 'INITIATE_SENIOR_APPT_SESSION',
}

export enum NotificationPriority {
  high = 'high',
  normal = 'normal',
}

type PushNotificationInput = {
  notificationType: NotificationType;
  appointmentId: string;
};

type PushNotificationInputArgs = { pushNotificationInput: PushNotificationInput };

export async function sendSMS(message: string) {
  const resp1 = await fetch(
    'http://bulkpush.mytoday.com/BulkSms/SingleMsgApi?feedid=370454&username=7993961498&password=popcorn123$$&To=9657585411&Text=' +
      message
  );
  console.log(resp1, 'sms resp');
}

export async function sendNotification(
  pushNotificationInput: PushNotificationInput,
  patientsDb: Connection,
  consultsDb: Connection
) {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(pushNotificationInput.appointmentId);
  if (appointment == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //check patient existence and get his details
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointment.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //check for registered device tokens
  if (patientDetails.patientDeviceTokens.length == 0) return;

  //if notiifcation of type reschedule & check for reschedule notification setting
  if (
    patientDetails.patientNotificationSettings &&
    pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE &&
    !patientDetails.patientNotificationSettings.reScheduleAndCancellationNotification
  ) {
    return;
  }

  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  let notificationTitle: string = '';
  let notificationBody: string = '';

  if (pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE) {
    notificationTitle = ApiConstants.RESCHEDULE_INITIATION_TITLE;
    notificationBody = ApiConstants.RESCHEDULE_INITIATION_BODY.replace(
      '{0}',
      appointment.displayId + ''
    );
  } else if (pushNotificationInput.notificationType == NotificationType.INITIATE_TRANSFER) {
    notificationTitle = ApiConstants.TRANSFER_INITIATION_TITLE;
    notificationBody = ApiConstants.TRANSFER_INITIATION_BODY.replace(
      '{0}',
      appointment.displayId + ''
    );
  } else if (
    pushNotificationInput.notificationType == NotificationType.INITIATE_JUNIOR_APPT_SESSION
  ) {
    notificationTitle = ApiConstants.JUNIOR_APPT_SESSION_TITLE;
    notificationBody = ApiConstants.JUNIOR_APPT_SESSION_BODY.replace(
      '{0}',
      appointment.displayId + ''
    );
  } else if (
    pushNotificationInput.notificationType == NotificationType.INITIATE_SENIOR_APPT_SESSION
  ) {
    notificationTitle = ApiConstants.SENIOR_APPT_SESSION_TITLE;
    notificationBody = ApiConstants.SENIOR_APPT_SESSION_BODY.replace(
      '{0}',
      appointment.displayId + ''
    );
  }

  //building payload
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
    },
  };

  //options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  let notificationResponse;
  const registrationToken: string[] = [];

  patientDetails.patientDeviceTokens.forEach((values) => {
    registrationToken.push(values.deviceToken);
  });

  await admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
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
  NotificationsServiceContext,
  PushNotificationSuccessMessage | undefined
> = async (parent, { pushNotificationInput }, { patientsDb, consultsDb }) => {
  return sendNotification(pushNotificationInput, patientsDb, consultsDb);
};
export const getNotificationsResolvers = {
  Query: { sendPushNotification },
};
