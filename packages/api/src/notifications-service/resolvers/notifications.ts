import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import * as firebaseAdmin from 'firebase-admin';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { Connection } from 'typeorm';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ApiConstants } from 'ApiConstants';
import { Patient, MedicineOrders } from 'profiles-service/entities';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { TransferAppointmentRepository } from 'consults-service/repositories/tranferAppointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { addMilliseconds, format } from 'date-fns';
import path from 'path';
import fs from 'fs';
import { log } from 'customWinstonLogger';

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

  enum APPT_CALL_TYPE {
    AUDIO
    VIDEO
    CHAT
  }

  enum DOCTOR_CALL_TYPE {
    SENIOR
    JUNIOR
  }

  input PushNotificationInput {
    notificationType: NotificationType
    appointmentId: String
  }

  input CartPushNotificationInput {
    notificationType: NotificationType
    orderAutoId: Int
  }

  extend type Query {
    sendPushNotification(
      pushNotificationInput: PushNotificationInput
    ): PushNotificationSuccessMessage

    testPushNotification(deviceToken: String): PushNotificationSuccessMessage
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
  CALL_APPOINTMENT = 'CALL_APPOINTMENT',
  MEDICINE_CART_READY = 'MEDICINE_CART_READY',
  MEDICINE_ORDER_PLACED = 'MEDICINE_ORDER_PLACED',
  MEDICINE_ORDER_CONFIRMED = 'MEDICINE_ORDER_CONFIRMED',
  MEDICINE_ORDER_OUT_FOR_DELIVERY = 'MEDICINE_ORDER_OUT_FOR_DELIVERY',
  MEDICINE_ORDER_DELIVERED = 'MEDICINE_ORDER_DELIVERED',
  DOCTOR_CANCEL_APPOINTMENT = 'DOCTOR_CANCEL_APPOINTMENT',
  PATIENT_REGISTRATION = 'PATIENT_REGISTRATION',
}

export enum APPT_CALL_TYPE {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  CHAT = 'CHAT',
}

export enum DOCTOR_CALL_TYPE {
  SENIOR = 'SENIOR',
  JUNIOR = 'JUNIOR',
}

export enum NotificationPriority {
  high = 'high',
  normal = 'normal',
}

type PushNotificationInput = {
  notificationType: NotificationType;
  appointmentId: string;
};

type CartPushNotificationInput = {
  notificationType: NotificationType;
  orderAutoId: number;
};

type PushNotificationInputArgs = { pushNotificationInput: PushNotificationInput };

export async function sendSMS(message: string) {
  const smsUrl = process.env.SMS_GATEWAY_URL ? process.env.SMS_GATEWAY_URL : '';
  if (smsUrl == '') {
    throw new AphError(AphErrorMessages.INVALID_SMS_GATEWAY_URL, undefined, {});
  }

  log(
    'notificationServiceLogger',
    `EXTERNAL_API_CALL_SMS: ${smsUrl}`,
    'sendSMS()->API_CALL_STARTING',
    JSON.stringify(smsUrl + '&To=9657585411&Text=' + message),
    ''
  );
  const smsResp = fetch(smsUrl + '&To=9657585411&Text=' + message);
  console.log(smsResp, 'sms resp');
}

export async function sendCallsNotification(
  pushNotificationInput: PushNotificationInput,
  patientsDb: Connection,
  consultsDb: Connection,
  doctorsDb: Connection,
  callType: APPT_CALL_TYPE,
  doctorType: DOCTOR_CALL_TYPE,
  appointmentCallId: string
) {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(pushNotificationInput.appointmentId);
  if (appointment == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  let doctorDetails;
  //get doctor details
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);

  if (doctorType == DOCTOR_CALL_TYPE.JUNIOR) {
    const consultQueueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
    const queueDetails = await consultQueueRepo.findByAppointmentId(
      pushNotificationInput.appointmentId
    );
    if (queueDetails == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
    doctorDetails = await doctorRepo.findById(queueDetails.doctorId);
  } else {
    doctorDetails = await doctorRepo.findById(appointment.doctorId);
  }
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

  let notificationTitle: string = '';
  let notificationBody: string = '';
  notificationTitle = ApiConstants.CALL_APPOINTMENT_TITLE;
  notificationBody = ApiConstants.CALL_APPOINTMENT_BODY.replace('{0}', patientDetails.firstName);
  notificationBody = notificationBody.replace(
    '{1}',
    doctorDetails.firstName + ' ' + doctorDetails.lastName
  );

  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  //building payload
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
    },
    data: {
      type: 'call_started',
      appointmentId: appointment.id.toString(),
      patientName: patientDetails.firstName,
      doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
      sound: 'incallmanager_ringtone.mp3',
      android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      callType,
      appointmentCallId,
      doctorType,
    },
  };

  console.log(payload, 'notification payload', pushNotificationInput.notificationType);
  //options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  let notificationResponse;
  const registrationToken: string[] = [];
  const allpatients = await patientRepo.getIdsByMobileNumber(patientDetails.mobileNumber);
  const listOfIds: string[] = [];
  allpatients.map((value) => listOfIds.push(value.id));
  console.log(listOfIds, 'listOfIds');
  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);
  const devicetokensofFamily = await deviceTokenRepo.deviceTokensOfAllIds(listOfIds);
  if (devicetokensofFamily.length > 0) {
    devicetokensofFamily.forEach((values) => {
      registrationToken.push(values.deviceToken);
    });
  }
  /*patientDetails.patientDeviceTokens.forEach((values) => {
    registrationToken.push(values.deviceToken);
  });*/
  console.log(registrationToken.length, patientDetails.mobileNumber, 'token length');
  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      notificationResponse = response;
      if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV + '_callnotification_' + format(new Date(), 'yyyyMMdd') + '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          pushNotificationInput.appointmentId +
          '\n multicastId: ';
        content +=
          response.multicastId.toString() +
          '\n------------------------------------------------------------------------------------\n';
        fs.appendFile(assetsDir + '/' + fileName, content, (err) => {
          if (err) {
            console.log('file saving error', err);
          }
          console.log('notification results saved');
        });
      }
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log(notificationResponse, 'notificationResponse');

  return notificationResponse;
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

  let notificationTitle: string = '';
  let notificationBody: string = '';
  if (pushNotificationInput.notificationType == NotificationType.DOCTOR_CANCEL_APPOINTMENT) {
    notificationTitle = ApiConstants.CANCEL_APPT_TITLE;
    notificationBody = ApiConstants.CANCEL_APPT_BODY.replace('{0}', patientDetails.firstName);
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
  } else if (pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE) {
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
  } else if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
    notificationTitle = ApiConstants.CALL_APPOINTMENT_TITLE;
    notificationBody = ApiConstants.CALL_APPOINTMENT_BODY.replace('{0}', patientDetails.firstName);
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
  }

  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  //building payload
  let payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
    },
    data: {},
  };

  if (pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        type: 'Reschedule_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        sound: 'default',
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
    };
  }

  if (
    pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT ||
    pushNotificationInput.notificationType == NotificationType.INITIATE_SENIOR_APPT_SESSION
  ) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        type: 'chat_room',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        sound: 'default',
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
    };
  }
  console.log(payload, 'notification payload', pushNotificationInput.notificationType);
  //options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  let notificationResponse;
  const registrationToken: string[] = [];

  const allpatients = await patientRepo.getIdsByMobileNumber(patientDetails.mobileNumber);
  const listOfIds: string[] = [];
  allpatients.map((value) => listOfIds.push(value.id));
  console.log(listOfIds, 'listOfIds');
  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);
  const devicetokensofFamily = await deviceTokenRepo.deviceTokensOfAllIds(listOfIds);
  if (devicetokensofFamily.length > 0) {
    devicetokensofFamily.forEach((values) => {
      registrationToken.push(values.deviceToken);
    });
  }
  /*patientDetails.patientDeviceTokens.forEach((values) => {
    registrationToken.push(values.deviceToken);
  });*/

  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      notificationResponse = response;
      if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV + '_callnotification_' + format(new Date(), 'yyyyMMdd') + '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          pushNotificationInput.appointmentId +
          '\n multicastId: ';
        content +=
          response.multicastId.toString() +
          '\n------------------------------------------------------------------------------------\n';
        fs.appendFile(assetsDir + '/' + fileName, content, (err) => {
          if (err) {
            console.log('file saving error', err);
          }
          console.log('notification results saved');
        });
      }
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log(notificationResponse, 'notificationResponse');

  return notificationResponse;
}

export async function sendCartNotification(
  pushNotificationInput: CartPushNotificationInput,
  patientsDb: Connection
) {
  let notificationTitle: string = '';
  let notificationBody: string = '';

  //check patient existence and get his details
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const medicineRepo = patientsDb.getCustomRepository(MedicineOrdersRepository);
  console.log(pushNotificationInput.orderAutoId, 'order auto id input');
  const medicineOrderDetails = await medicineRepo.getMedicineOrderWithId(
    pushNotificationInput.orderAutoId
  );
  console.log(pushNotificationInput.orderAutoId, 'order auto id input222');
  if (medicineOrderDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);
  const patientDetails = await patientRepo.getPatientDetails(medicineOrderDetails.patient.id);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);
  if (pushNotificationInput.notificationType == NotificationType.MEDICINE_CART_READY) {
    notificationTitle = ApiConstants.CART_READY_TITLE;
    notificationBody = ApiConstants.CART_READY_BODY.replace('{0}', patientDetails.firstName);
  } else if (pushNotificationInput.notificationType == NotificationType.MEDICINE_ORDER_DELIVERED) {
    notificationTitle = ApiConstants.ORDER_DELIVERY_TITLE;
    notificationBody = ApiConstants.ORDER_DELIVERY_BODY.replace('{0}', patientDetails.firstName);
    notificationBody = notificationBody.replace(
      '{1}',
      pushNotificationInput.orderAutoId.toString()
    );
  }

  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  //building payload
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
    },
    data: {
      type: 'Cart_Ready',
      orderId: pushNotificationInput.orderAutoId.toString(),
      orderAutoId: '',
      statusDate: '',
      firstName: patientDetails.firstName,
    },
  };

  if (pushNotificationInput.notificationType == NotificationType.MEDICINE_ORDER_DELIVERED) {
    payload.data = {
      type: 'Order_Delivered',
      orderAutoId: pushNotificationInput.orderAutoId.toString(),
      orderId: medicineOrderDetails.id,
      statusDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
      firstName: patientDetails.firstName,
    };
  }

  console.log(payload, 'notification payload', pushNotificationInput.notificationType);
  //options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  let notificationResponse;
  const registrationToken: string[] = [];

  const allpatients = await patientRepo.getIdsByMobileNumber(patientDetails.mobileNumber);
  const listOfIds: string[] = [];
  allpatients.map((value) => listOfIds.push(value.id));
  console.log(listOfIds, 'listOfIds');
  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);
  const devicetokensofFamily = await deviceTokenRepo.deviceTokensOfAllIds(listOfIds);
  if (devicetokensofFamily.length > 0) {
    devicetokensofFamily.forEach((values) => {
      registrationToken.push(values.deviceToken);
    });
  }
  /*patientDetails.patientDeviceTokens.forEach((values) => {
    registrationToken.push(values.deviceToken);
  });*/

  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      notificationResponse = response;
      if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV + '_ordernotification_' + format(new Date(), 'yyyyMMdd') + '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          pushNotificationInput.orderAutoId.toString() +
          '\n multicastId: ';
        content +=
          response.multicastId.toString() +
          '\n------------------------------------------------------------------------------------\n';
        fs.appendFile(assetsDir + '/' + fileName, content, (err) => {
          if (err) {
            console.log('file saving error', err);
          }
          console.log('notification results saved');
        });
      }
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log(notificationResponse, 'notificationResponse');

  return notificationResponse;
}

//common method to get all the patient device tokens
export async function getPatientDeviceTokens(mobileNumber: string, patientsDb: Connection) {
  const patientDeviceTokens: string[] = [];
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);

  //get all patients of a mobile number
  const allRelatedPatients = await patientRepo.getIdsByMobileNumber(mobileNumber);
  const patientIds = allRelatedPatients.map((patient) => patient.id);
  console.log(patientIds, 'patientIds');

  //get all device tokens data of related patients
  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);
  const patientAllDeviceTokens = await deviceTokenRepo.deviceTokensOfAllIds(patientIds);

  //collect the deviceToken values
  if (patientAllDeviceTokens.length > 0) {
    patientAllDeviceTokens.forEach((values) => {
      patientDeviceTokens.push(values.deviceToken);
    });
  }

  return patientDeviceTokens;
}

//get initialized firebase admin
export async function getInitializedFirebaseAdmin() {
  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  const admin = !firebaseAdmin.apps.length
    ? firebaseAdmin.initializeApp(config)
    : firebaseAdmin.app();

  return admin;
}

//utility method to get the notification log file name based on notification type
export function getNotificationLogFileName(notificationType: NotificationType) {
  const currentDate = format(new Date(), 'yyyyMMdd');
  switch (notificationType) {
    case NotificationType.PATIENT_REGISTRATION:
      return `${process.env.NODE_ENV}_registration_notification_${currentDate}.txt`;
    case NotificationType.MEDICINE_ORDER_PLACED:
      return `${process.env.NODE_ENV}_order_placed_notification_${currentDate}.txt`;
    case NotificationType.MEDICINE_ORDER_CONFIRMED:
      return `${process.env.NODE_ENV}_order_cofirmed_notification_${currentDate}.txt`;
    case NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY:
      return `${process.env.NODE_ENV}_order_out_for_delivery_notification_${currentDate}.txt`;
    default:
      return `${process.env.NODE_ENV}_registration_notification_${currentDate}.txt`;
  }
}

//utility method to log the notification response
export function logNotificationResponse(type: NotificationType, logData: Object) {
  //get log file name
  const fileName = getNotificationLogFileName(type);

  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }

  let content = format(new Date(), 'yyyy-MM-dd hh:mm');
  Object.entries(logData).forEach(([key, value]) => {
    content += `\n ${key}: ${value.toString()}`;
  });
  content += '\n-----------------------------------------------------------------\n';

  console.log(type, fileName, content);

  fs.appendFile(`${assetsDir}/${fileName}`, content, (err) => {
    if (err) {
      console.log('notification file saving error', err);
    }
    console.log('notification results saved successfully');
  });
}

export async function sendPatientRegistrationNotification(
  patient: Patient,
  patientsDb: Connection
) {
  //get all the patient device tokens
  let patientDeviceTokens: string[] = [];
  patientDeviceTokens = await getPatientDeviceTokens(patient.mobileNumber, patientsDb);

  if (patientDeviceTokens.length == 0) return;

  //notification payload
  const notificationTitle = ApiConstants.PATIENT_REGISTRATION_TITLE.toString();
  const notificationBody = ApiConstants.PATIENT_REGISTRATION_BODY.replace('{0}', patient.firstName);
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
    },
    data: {
      type: 'Registration_Success',
      patientId: patient.id,
      firstName: patient.firstName,
    },
  };

  //notification options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };

  //initialize firebaseadmin
  const admin = await getInitializedFirebaseAdmin();

  admin
    .messaging()
    .sendToDevice(patientDeviceTokens, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      const logData = { patientId: patient.id, multicastId: response.multicastId };
      logNotificationResponse(NotificationType.PATIENT_REGISTRATION, logData);
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log('push notifications sent');
  return { status: true };
}

//Notification - Medicine order Status Changes
export async function sendMedicineOrderStatusNotification(
  notificationType: NotificationType,
  orderDetails: MedicineOrders,
  patientsDb: Connection
) {
  //get all the patient device tokens
  let patientDeviceTokens: string[] = [];
  const patientDetails = orderDetails.patient;
  patientDeviceTokens = await getPatientDeviceTokens(patientDetails.mobileNumber, patientsDb);

  if (patientDeviceTokens.length == 0) return;

  let notificationTitle: string = '';
  let notificationBody: string = '';
  let payloadDataType: string = '';

  switch (notificationType) {
    case NotificationType.MEDICINE_ORDER_PLACED:
      payloadDataType = 'Order_Placed';
      notificationTitle = ApiConstants.ORDER_PLACED_TITLE;
      notificationBody = ApiConstants.ORDER_PLACED_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_CONFIRMED:
      payloadDataType = 'Order_Confirmed';
      notificationTitle = ApiConstants.ORDER_CONFIRMED_TITLE;
      notificationBody = ApiConstants.ORDER_CONFIRMED_BODY;
    case NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY:
      payloadDataType = 'Order_Out_For_Delivery';
      notificationTitle = ApiConstants.ORDER_OUT_FOR_DELIVERY_TITLE;
      notificationBody = ApiConstants.ORDER_OUT_FOR_DELIVERY_BODY;
      break;
    default:
      payloadDataType = 'Order_Placed';
      notificationTitle = ApiConstants.ORDER_PLACED_TITLE;
      notificationBody = ApiConstants.ORDER_PLACED_BODY;
  }

  //notification payload
  notificationTitle = notificationTitle.toString();
  notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
  notificationBody = notificationBody.replace('{1}', orderDetails.orderAutoId.toString());
  notificationBody = notificationBody.replace('{2}', orderDetails.orderTat.toString());

  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
    },
    data: {
      type: payloadDataType,
      orderAutoId: orderDetails.orderAutoId.toString(),
      orderId: orderDetails.id,
      statusDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
      firstName: patientDetails.firstName,
    },
  };

  //notification options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };

  //initialize firebaseadmin
  const admin = await getInitializedFirebaseAdmin();

  admin
    .messaging()
    .sendToDevice(patientDeviceTokens, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      const logData = {
        patientId: patientDetails.id,
        orderAutoId: orderDetails.orderAutoId,
        orderId: orderDetails.id,
        multicastId: response.multicastId,
      };
      logNotificationResponse(notificationType, logData);
    })
    .catch((error: JSON) => {
      console.log('PushNotificationFailed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log('push notifications sent');
  return { status: true };
}

const sendPushNotification: Resolver<
  null,
  PushNotificationInputArgs,
  NotificationsServiceContext,
  PushNotificationSuccessMessage | undefined
> = async (parent, { pushNotificationInput }, { patientsDb, consultsDb, doctorsDb }) => {
  return sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
};

const testPushNotification: Resolver<
  null,
  { deviceToken: String },
  NotificationsServiceContext,
  PushNotificationSuccessMessage | undefined
> = async (parent, args, {}) => {
  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  //building payload
  const payload = {
    notification: {
      title: 'Test Push notification title',
      body: 'Test Push notification body',
    },
    data: {
      type: 'Reschedule-Appointment',
      appointmentData: '1234',
      doctorName: 'junior',
      patientName: 'krishna',
    },
  };

  //options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  let notificationResponse;
  const registrationToken: string = <string>args.deviceToken;

  await admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      console.log('response:::', response);
      notificationResponse = response;
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  return notificationResponse;
};
export const getNotificationsResolvers = {
  Query: { sendPushNotification, testPushNotification },
};
