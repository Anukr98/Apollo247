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
import { TransferAppointmentRepository } from 'consults-service/repositories/tranferAppointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { addMilliseconds, format } from 'date-fns';

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
  BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
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
  const smsUrl = process.env.SMS_GATEWAY_URL ? process.env.SMS_GATEWAY_URL : '';
  if (smsUrl == '') {
    throw new AphError(AphErrorMessages.INVALID_SMS_GATEWAY_URL, undefined, {});
  }
  const smsResp = fetch(smsUrl + '&To=9657585411&Text=' + message);
  console.log(smsResp, 'sms resp');
}

export async function sendNotification(
  pushNotificationInput: PushNotificationInput,
  patientsDb: Connection,
  consultsDb: Connection,
  doctorsDb: Connection
) {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(pushNotificationInput.appointmentId);
  if (appointment == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get doctor details
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorDetails = await doctorRepo.findById(appointment.doctorId);
  if (doctorDetails == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
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
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
  } else if (pushNotificationInput.notificationType == NotificationType.INITIATE_TRANSFER) {
    const transferRepo = consultsDb.getCustomRepository(TransferAppointmentRepository);
    const transferApptDetails = await transferRepo.getTransferDetails(
      pushNotificationInput.appointmentId
    );
    if (transferApptDetails == null) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);
    }
    const transferDoctorDetails = await doctorRepo.findById(
      transferApptDetails.transferredDoctorId
    );
    if (transferDoctorDetails == null) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);
    }
    notificationTitle = ApiConstants.TRANSFER_INITIATION_TITLE;
    notificationBody = ApiConstants.TRANSFER_INITIATION_BODY.replace(
      '{0}',
      transferDoctorDetails.firstName + ' ' + transferDoctorDetails.lastName
    );
  } else if (
    pushNotificationInput.notificationType == NotificationType.INITIATE_JUNIOR_APPT_SESSION
  ) {
    notificationTitle = ApiConstants.JUNIOR_APPT_SESSION_TITLE;
    notificationBody = ApiConstants.JUNIOR_APPT_SESSION_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    notificationBody = notificationBody.replace(
      '{2}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
  } else if (
    pushNotificationInput.notificationType == NotificationType.INITIATE_SENIOR_APPT_SESSION
  ) {
    notificationTitle = ApiConstants.SENIOR_APPT_SESSION_TITLE;
    notificationBody = ApiConstants.SENIOR_APPT_SESSION_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
  } else if (pushNotificationInput.notificationType == NotificationType.BOOK_APPOINTMENT) {
    let smsMessage = ApiConstants.BOOK_APPOINTMENT_SMS_MESSAGE.replace(
      '{0}',
      patientDetails.firstName
    );
    smsMessage = smsMessage.replace('{1}', appointment.displayId.toString());
    smsMessage = smsMessage.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);
    const smsDate = format(istDateTime, 'dd-MM-yyyy HH:mm');
    smsMessage = smsMessage.replace('{3}', smsDate.toString());
    smsMessage = smsMessage.replace('at {4}', '');
    notificationTitle = ApiConstants.BOOK_APPOINTMENT_TITLE;
    notificationBody = smsMessage;
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
> = async (parent, { pushNotificationInput }, { patientsDb, consultsDb, doctorsDb }) => {
  return sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
};
export const getNotificationsResolvers = {
  Query: { sendPushNotification },
};
