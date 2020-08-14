import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import * as firebaseAdmin from 'firebase-admin';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { Connection } from 'typeorm';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ApiConstants } from 'ApiConstants';
import {
  Patient,
  MedicineOrders,
  DiagnosticOrders,
  MEDICINE_ORDER_PAYMENT_TYPE,
  DEVICE_TYPE,
  MedicineOrderPayments,
} from 'profiles-service/entities';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AppointmentRefundsRepository } from 'consults-service/repositories/appointmentRefundsRepository';
import { DoctorDeviceTokenRepository } from 'doctors-service/repositories/doctorDeviceTokenRepository';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { TransferAppointmentRepository } from 'consults-service/repositories/tranferAppointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import {
  addMilliseconds,
  format,
  differenceInMinutes,
  addDays,
  differenceInHours,
  addMinutes,
} from 'date-fns';
import path from 'path';
import fs from 'fs';
import { log } from 'customWinstonLogger';
import { APPOINTMENT_TYPE, Appointment, STATUS } from 'consults-service/entities';
import Pubnub from 'pubnub';
import fetch from 'node-fetch';
import { Doctor, DoctorType } from 'doctors-service/entities';
import * as child_process from 'child_process';

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

  type SendChatMessageToDoctorResult {
    status: Boolean
  }

  type SendDoctorApptReminderResult {
    status: Boolean
    apptsListCount: Int
  }

  type SendSMS {
    status: String
    message: String
  }

  extend type Query {
    sendPushNotification(
      pushNotificationInput: PushNotificationInput
    ): PushNotificationSuccessMessage

    testPushNotification(deviceToken: String): PushNotificationSuccessMessage
    sendDailyAppointmentSummary: String
    sendFollowUpNotification: String
    sendChatMessageToDoctor(
      appointmentId: String
      chatMessage: String
    ): SendChatMessageToDoctorResult
    sendMessageToMobileNumber(mobileNumber: String, textToSend: String): SendSMS
    sendDoctorReminderNotifications(nextMin: Int): SendDoctorApptReminderResult
  }
`;

type PushNotificationMessage = {
  messageId: string;
};

type SendChatMessageToDoctorResult = {
  status: boolean;
};

type SendDoctorApptReminderResult = {
  status: boolean;
  apptsListCount: number;
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
  MEDICINE_ORDER_PAYMENT_FAILED = 'MEDICINE_ORDER_PAYMENT_FAILED',
  MEDICINE_ORDER_OUT_FOR_DELIVERY = 'MEDICINE_ORDER_OUT_FOR_DELIVERY',
  MEDICINE_ORDER_DELIVERED = 'MEDICINE_ORDER_DELIVERED',
  MEDICINE_ORDER_PICKEDUP = 'MEDICINE_ORDER_PICKEDUP',
  MEDICINE_ORDER_READY_AT_STORE = 'MEDICINE_ORDER_READY_AT_STORE',
  DOCTOR_CANCEL_APPOINTMENT = 'DOCTOR_CANCEL_APPOINTMENT',
  PATIENT_REGISTRATION = 'PATIENT_REGISTRATION',
  APPOINTMENT_REMINDER_15 = 'APPOINTMENT_REMINDER_15',
  APPOINTMENT_CASESHEET_REMINDER_15 = 'APPOINTMENT_CASESHEET_REMINDER_15',
  PATIENT_APPOINTMENT_RESCHEDULE = 'PATIENT_APPOINTMENT_RESCHEDULE',
  DIAGNOSTIC_ORDER_SUCCESS = 'DIAGNOSTIC_ORDER_SUCCESS',
  DIAGNOSTIC_ORDER_PAYMENT_FAILED = 'DIAGNOSTIC_ORDER_PAYMENT_FAILED',
  PATIENT_CANCEL_APPOINTMENT = 'PATIENT_CANCEL_APPOINTMENT',
  PHYSICAL_APPT_60 = 'PHYSICAL_APPT_60',
  PHYSICAL_APPT_180 = 'PHYSICAL_APPT_180',
  PHYSICAL_APPT_1 = 'PHYSICAL_APPT_1',
  PATIENT_NO_SHOW = 'PATIENT_NO_SHOW',
  ACCEPT_RESCHEDULED_APPOINTMENT = 'ACCEPT_RESCHEDULED_APPOINTMENT',
  RESCHEDULE_APPOINTMENT_BY_PATIENT = 'RESCHEDULE_APPOINTMENT_BY_PATIENT',
  PRESCRIPTION_READY = 'PRESCRIPTION_READY',
  VIRTUAL_REMINDER_15 = 'VIRTUAL_REMINDER_15',
  APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL = 'APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL',
  DOCTOR_NO_SHOW_INITIATE_RESCHEDULE = 'DOCTOR_NO_SHOW_INITIATE_RESCHEDULE',
  PAYMENT_PENDING_SUCCESS = 'PAYMENT_PENDING_SUCCESS',
  PAYMENT_PENDING_FAILURE = 'PAYMENT_PENDING_FAILURE',
  APPOINTMENT_PAYMENT_REFUND = 'APPOINTMENT_PAYMENT_REFUND',
  DOCTOR_APPOINTMENT_REMINDER = 'DOCTOR_APPOINTMENT_REMINDER',
  MEDICINE_ORDER_BILL_CHANGED = 'MEDICINE_ORDER_BILL_CHANGED',
  WHATSAPP_CHAT_NOTIFICATION = 'WHATSAPP_CHAT_NOTIFICATION',
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

type MedicineOrderRefundNotificationInput = {
  refundAmount: number;
  healthCreditsRefunded: number;
  paymentInfo: MedicineOrderPayments;
  reasonCode?: string;
  isPartialRefund: boolean;
  isRefundSuccessful: boolean;
};

type PushNotificationInput = {
  notificationType: NotificationType;
  appointmentId: string;
  doctorNotification?: boolean;
  blobName?: string;
};

type CartPushNotificationInput = {
  notificationType: NotificationType;
  orderAutoId: number;
};

type PushNotificationInputArgs = { pushNotificationInput: PushNotificationInput };

/*export async function sendSMS(message: string) {
  const smsUrl = process.env.SMS_GATEWAY_URL ? process.env.SMS_GATEWAY_URL : '';
  if (smsUrl == '') {
    throw new AphError(AphErrorMessages.INVALID_SMS_GATEWAY_URL, undefined, {});
  log(
    'notificationServiceLogger',
    `EXTERNAL_API_CALL_SMS: ${smsUrl}`,
    'sendSMS()->API_CALL_STARTING',
    JSON.stringify(smsUrl + '&To=9657585411&Text=' + message),
    ''
  );
  const smsResp = fetch(smsUrl + '&To=9657585411&Text=' + message);
  console.log(smsResp, 'sms resp');
}*/

export const sendNotificationWhatsapp = async (
  mobileNumber: string,
  message: string,
  loginType: number
) => {
  /*const apiUrl =
    process.env.WHATSAPP_URL +
    '?method=OPT_IN&phone_number=' +
    mobileNumber +
    '&userid=' +
    process.env.WHATSAPP_USERNAME +
    '&password=' +
    process.env.WHATSAPP_PASSWORD +
    '&auth_scheme=plain&format=text&v=1.1&channel=WHATSAPP';
  const whatsAppResponse = await fetch(apiUrl)
    .then(async (res) => {
      if (loginType == 1) {
        const sendApiUrl = `${process.env.WHATSAPP_URL}?method=SendMessage&send_to=${mobileNumber}&userid=${process.env.WHATSAPP_USERNAME}&password=${process.env.WHATSAPP_PASSWORD}&auth_scheme=plain&msg_type=TEXT&format=text&v=1.1&msg=${message}`;
        fetch(sendApiUrl)
          .then((res) => res)
          .catch((error) => {
            console.log('whatsapp error', error);
            throw new AphError(AphErrorMessages.MESSAGE_SEND_WHATSAPP_ERROR);
          });
      }
    })
    .catch((error) => {
      throw new AphError(AphErrorMessages.GET_OTP_ERROR);
    });
  return whatsAppResponse;*/
  return true;
};

export const sendDoctorNotificationWhatsapp = async (
  templateName: string,
  phoneNumber: string,
  templateData: string[]
) => {
  const scenarioUrl = process.env.WHATSAPP_SCENARIO_URL ? process.env.WHATSAPP_SCENARIO_URL : '';
  const scenarioResponse = await fetch(scenarioUrl, {
    method: 'POST',
    body: JSON.stringify({
      name: 'New Scenario',
      flow: [
        {
          from: process.env.WHATSAPP_DOCTOR_NUMBER ? process.env.WHATSAPP_DOCTOR_NUMBER : '',
          channel: 'WHATSAPP',
        },
      ],
      default: true,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.WHATSAPP_AUTH_HEADER ? process.env.WHATSAPP_AUTH_HEADER : '',
    },
  });
  const textRes = await scenarioResponse.text();
  const keyResp = JSON.parse(textRes);
  console.log(keyResp.key, 'scenario key');
  const url = process.env.WHATSAPP_SEND_URL ? process.env.WHATSAPP_SEND_URL : '';
  if (keyResp) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        scenarioKey: keyResp.key,
        destinations: [{ to: { phoneNumber } }],
        whatsApp: {
          templateName,
          templateData,
          language: 'en',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.WHATSAPP_AUTH_HEADER ? process.env.WHATSAPP_AUTH_HEADER : '',
      },
    });
    console.log(response, 'response');
  }
};

export const sendNotificationSMS = async (mobileNumber: string, message: string) => {
  //Adding Apollo 247 string at starting of the body
  message = '[Apollo 247] ' + message;

  const apiBaseUrl = process.env.KALEYRA_OTP_API_BASE_URL;
  const apiUrlWithKey = `${apiBaseUrl}?api_key=${process.env.KALEYRA_NOTIFICATION_API_KEY}`;
  const queryParams = `&method=${ApiConstants.KALEYRA_OTP_SMS_METHOD}&message=${message}&to=${mobileNumber}&sender=${ApiConstants.KALEYRA_OTP_SENDER}`;

  const apiUrl = `${apiUrlWithKey}${queryParams}`;
  //logging api call data here
  log('smsOtpAPILogger', `OPT_API_CALL: ${apiUrl}`, 'sendSMS()->API_CALL_STARTING', '', '');
  const smsResponse = await fetch(apiUrl)
    .then((res) => res.json())
    .catch((error) => {
      //logging error here
      log('smsOtpAPILogger', `API_CALL_ERROR`, 'sendSMS()->CATCH_BLOCK', '', JSON.stringify(error));
      throw new AphError(AphErrorMessages.CREATE_OTP_ERROR);
    });

  console.log('smsResponse================', smsResponse);
  return smsResponse;
};

export async function hitCallKitCurl(
  token: string,
  doctorName: string,
  apptId: string,
  connecting: boolean,
  callType: APPT_CALL_TYPE,
  isDev: boolean
) {
  const CERT_PATH = process.env.VOIP_CALLKIT_CERT_PATH + '/voipCert.pem';
  const passphrase = process.env.VOIP_CALLKIT_PASSPHRASE || 'apollo@123';
  let domain = process.env.VOIP_CALLKIT_DOMAIN || 'https://api.push.apple.com/3/device/';
  if (isDev) {
    domain = 'https://api.development.push.apple.com/3/device/';
  }
  try {
    const curlCommand = `curl -v -d '{"name": "${doctorName}", 
      "${connecting ? 'isVideo' : 'disconnectCall'}": 
      ${connecting ? (callType == APPT_CALL_TYPE.VIDEO ? true : false) : true}, 
      "appointmentId" : "${apptId}"}' --http2 --cert ${CERT_PATH}:${passphrase} ${domain}${token}`;
    const resp = child_process.execSync(curlCommand);
    const result = resp.toString('utf-8');
    console.log('voipCallKit result > ', result);
    console.log('curlCommand > ', curlCommand);
  } catch (err) {
    console.error('voipCallKit error > ', err);
  }
}

export async function sendCallsDisconnectNotification(
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

  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  //building payload
  const payload = {
    data: {
      type: 'call_disconnect',
      appointmentId: appointment.id.toString(),
      doctorName: 'Dr. ' + doctorDetails.firstName,
    },
  };

  console.log(payload, 'notification payload', pushNotificationInput.notificationType);
  //options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline,
    contentAvailable: true,
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

  console.log(registrationToken.length, patientDetails.mobileNumber, 'token length');
  if (registrationToken.length == 0) return;
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

export async function sendCallsNotification(
  pushNotificationInput: PushNotificationInput,
  patientsDb: Connection,
  consultsDb: Connection,
  doctorsDb: Connection,
  callType: APPT_CALL_TYPE,
  doctorType: DOCTOR_CALL_TYPE,
  appointmentCallId: string,
  isDev: boolean,
  numberOfParticipants: number
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

  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);

  const voipPushtoken = await deviceTokenRepo.getDeviceVoipPushToken(
    patientDetails.id,
    DEVICE_TYPE.IOS
  );
  if (
    voipPushtoken.length &&
    voipPushtoken[voipPushtoken.length - 1]['deviceVoipPushToken'] &&
    callType != APPT_CALL_TYPE.CHAT
  ) {
    hitCallKitCurl(
      voipPushtoken[voipPushtoken.length - 1]['deviceVoipPushToken'],
      doctorDetails.displayName,
      appointment.id,
      true,
      callType,
      isDev
    );
  }
  if (callType == APPT_CALL_TYPE.CHAT && doctorType == DOCTOR_CALL_TYPE.SENIOR) {
    const devLink = process.env.DOCTOR_DEEP_LINK ? process.env.DOCTOR_DEEP_LINK : '';
    let whatsappMsg = ApiConstants.WHATSAPP_SD_CONSULT_START_REMINDER.replace(
      '{0}',
      patientDetails.firstName + ' ' + patientDetails.lastName
    );
    whatsappMsg = whatsappMsg
      .replace('{1}', doctorDetails.firstName)
      .replace('{2}', doctorDetails.salutation)
      .replace('{3}', devLink);
    sendNotificationWhatsapp(patientDetails.mobileNumber, whatsappMsg, 1);
    return;
  } else if (callType == APPT_CALL_TYPE.CHAT && doctorType == DOCTOR_CALL_TYPE.JUNIOR) {
    const devLink = process.env.DOCTOR_DEEP_LINK ? process.env.DOCTOR_DEEP_LINK : '';
    let whatsappMsg = ApiConstants.WHATSAPP_JD_CONSULT_START_REMINDER.replace(
      '{0}',
      patientDetails.firstName + ' ' + patientDetails.lastName
    );
    whatsappMsg = whatsappMsg
      .replace('{1}', doctorDetails.firstName)
      .replace('{2}', doctorDetails.salutation)
      .replace('{3}', devLink);
    sendNotificationWhatsapp(patientDetails.mobileNumber, whatsappMsg, 1);
    return;
  }
  let notificationTitle: string = '';
  let notificationBody: string = '';
  notificationTitle = ApiConstants.CALL_APPOINTMENT_TITLE;
  notificationBody = ApiConstants.AVCALL_APPOINTMENT_BODY;
  if (doctorType == DOCTOR_CALL_TYPE.JUNIOR) {
    notificationBody = ApiConstants.JUNIOR_AVCALL_APPOINTMENT_BODY;
  }

  notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
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
      sound: 'incallmanager_ringtone.mp3',
      android_channel_id: 'fcm_FirebaseNotifiction_call_channel',
    },
    data: {
      type: 'call_started',
      appointmentId: appointment.id.toString(),
      patientName: patientDetails.firstName,
      doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
      callType,
      appointmentCallId,
      doctorType,
      content: notificationBody,
    },
  };

  console.log(payload, 'notification payload', pushNotificationInput.notificationType);
  //options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline,
    contentAvailable: true,
  };
  let notificationPayloadResponse;
  const registrationToken: string[] = [];
  const allpatients = await patientRepo.getIdsByMobileNumber(patientDetails.mobileNumber);
  const listOfIds: string[] = [];
  allpatients.map((value) => listOfIds.push(value.id));
  console.log(listOfIds, 'listOfIds');

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
  if (registrationToken.length == 0) return;

  //First payload (data only)
  let dataOnlyPayloadResponse = null;
  const sendDataOnlyPayload =
    callType != APPT_CALL_TYPE.CHAT && numberOfParticipants && numberOfParticipants == 1;

  if (sendDataOnlyPayload) {
    const dataOnlyPayload = {
      data: {
        type: 'call_start',
        appointmentId: appointment.id.toString(),
        doctorName: 'Dr. ' + doctorDetails.firstName,
      },
    };

    admin
      .messaging()
      .sendToDevice(registrationToken, dataOnlyPayload, options)
      .then((response: PushNotificationSuccessMessage) => {
        dataOnlyPayloadResponse = response;
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

    console.log(dataOnlyPayloadResponse, 'dataOnlyPayloadResponse');
  }

  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      notificationPayloadResponse = response;
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

  console.log(notificationPayloadResponse, 'notificationPayloadResponse');

  return {
    notificationPayloadResponse: notificationPayloadResponse,
    dataOnlyPayloadResponse: dataOnlyPayloadResponse,
  };
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
  console.log(patientDetails, 'patient details in notification');
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //check for registered device tokens
  //if (patientDetails.patientDeviceTokens.length == 0) return;

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
  const notificationSound: string = ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString();
  const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);
  const apptDate = format(
    addMinutes(new Date(appointment.appointmentDateTime), +330),
    'yyyy-MM-dd HH:mm:ss'
  );
  if (pushNotificationInput.notificationType == NotificationType.PATIENT_CANCEL_APPOINTMENT) {
    notificationTitle = ApiConstants.PATIENT_CANCEL_APPT_TITLE;
    notificationBody = ApiConstants.PATIENT_CANCEL_APPT_BODY.replace(
      '{0}',
      patientDetails.firstName
    );

    notificationBody = notificationBody.replace('{1}', appointment.displayId.toString());
    notificationBody = notificationBody.replace(
      '{2}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    notificationBody = notificationBody.replace('{3}', apptDate);

    const finalString = ` Click here ${process.env.SMS_LINK_BOOK_APOINTMENT} ${ApiConstants.PATIENT_CANCEL_APPT_BODY_END}`;
    let cancelApptSMS = process.env.SMS_LINK_BOOK_APOINTMENT ? finalString : '';
    cancelApptSMS = notificationBody + cancelApptSMS;

    console.log('cancelApptSMS======================', cancelApptSMS);
    sendNotificationSMS(patientDetails.mobileNumber, cancelApptSMS ? cancelApptSMS : '');
    //send sms to doctor
    let doctorSMS = ApiConstants.DOCTOR_PATIENT_CANCEL_SMS.replace('{0}', doctorDetails.fullName);
    doctorSMS = doctorSMS.replace('{1}', appointment.displayId.toString());
    doctorSMS = doctorSMS.replace('{2}', patientDetails.firstName);
    doctorSMS = doctorSMS.replace('{3}', apptDate.toString());

    sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);

    sendBrowserNotitication(doctorDetails.id, doctorSMS);
  }

  //doctor cancel appointment
  else if (pushNotificationInput.notificationType == NotificationType.DOCTOR_CANCEL_APPOINTMENT) {
    notificationTitle = ApiConstants.CANCEL_APPT_TITLE;
    notificationBody = ApiConstants.CANCEL_APPT_BODY.replace('{0}', patientDetails.firstName);
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    let smsLink = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Click here ' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;

    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
  }

  //INITIATE_RESCHEDULE
  else if (pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE) {
    notificationTitle = ApiConstants.RESCHEDULE_INITIATION_TITLE;
    notificationBody = ApiConstants.RESCHEDULE_INITIATION_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    let smsLink = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Reschedule Now ' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;
    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
  }

  //doctor no show
  else if (
    pushNotificationInput.notificationType == NotificationType.DOCTOR_NO_SHOW_INITIATE_RESCHEDULE
  ) {
    notificationTitle = ApiConstants.RESCHEDULE_INITIATION_TITLE;
    notificationBody = ApiConstants.RESCHEDULE_INITIATION_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    let smsLink = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Reschedule Now ' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;

    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
  }

  //patient no show
  else if (pushNotificationInput.notificationType == NotificationType.PATIENT_NO_SHOW) {
    notificationTitle = ApiConstants.PATIENT_NO_SHOW_RESCHEDULE_TITLE;
    notificationBody = ApiConstants.PATIENT_NO_SHOW_RESCHEDULE_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    let smsLink = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Click here ' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;
    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
  }

  //initiate transfer
  else if (pushNotificationInput.notificationType == NotificationType.INITIATE_TRANSFER) {
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
  }

  //junior doctor schedule
  else if (
    pushNotificationInput.notificationType == NotificationType.INITIATE_JUNIOR_APPT_SESSION
  ) {
    notificationTitle = ApiConstants.JUNIOR_APPT_SESSION_TITLE;
    notificationBody = ApiConstants.JUNIOR_APPT_SESSION_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace(
      '{2}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
  }

  //senior doctor schedule
  else if (
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
  }

  //book appointment
  else if (pushNotificationInput.notificationType == NotificationType.BOOK_APPOINTMENT) {
    let content = ApiConstants.BOOK_APPOINTMENT_BODY_WITH_CLICK.replace(
      '{0}',
      patientDetails.firstName
    );
    let smsLink = ApiConstants.BOOK_APPOINTMENT_BODY_WITH_CLICK.replace(
      '{0}',
      patientDetails.firstName
    );
    if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
      content = ApiConstants.PHYSICAL_BOOK_APPOINTMENT_BODY.replace(
        '{0}',
        patientDetails.firstName
      );
      smsLink = ApiConstants.PHYSICAL_BOOK_APPOINTMENT_BODY_WITH_CLICK.replace(
        '{0}',
        patientDetails.firstName
      );

      if (appointment.hospitalId != '' && appointment.hospitalId != null) {
        const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
        const facilityDets = await facilityRepo.getfacilityDetails(appointment.hospitalId);
        if (facilityDets) {
          const facilityDetsString = `${facilityDets.name} ${facilityDets.streetLine1} ${facilityDets.city} ${facilityDets.state}`;
          content = content.replace('{4}', facilityDetsString);
          smsLink = smsLink.replace('{4}', facilityDetsString);
        }
      }
    }
    content = content.replace('{1}', appointment.displayId.toString());
    content = content.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    content = content.replace('{3}', apptDate.toString());

    smsLink = smsLink.replace('{1}', appointment.displayId.toString());
    smsLink = smsLink.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    smsLink = smsLink.replace('{3}', apptDate.toString());

    //Create chatroom link and send for new booked appointment
    if (process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM) {
      const chatroom_sms_link = process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM.replace(
        '{0}',
        appointment.id.toString()
      );
      smsLink = smsLink.replace('{5}', chatroom_sms_link);
    } else {
      throw new AphError(AphErrorMessages.SMS_DEEPLINK_APPOINTMENT_CHATROOM_MISSING);
    }

    notificationTitle = ApiConstants.BOOK_APPOINTMENT_TITLE;
    notificationBody = content;
    //send sms
    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
    //send whatsapp message
    //sendNotificationWhatsapp(patientDetails.mobileNumber, smsLink);

    //send sms to doctor if Appointment DateTime is less than 24 hours
    const todaysDateTime = addMilliseconds(new Date(), 19800000);
    const todaysDate = new Date(format(todaysDateTime, 'yyyy-MM-dd') + 'T23:59:00');
    console.log(
      'check dates for todays date appt',
      appointment.appointmentDateTime,
      new Date(),
      differenceInHours(appointment.appointmentDateTime, new Date()),
      todaysDate,
      'todays date'
    );
    if (istDateTime <= todaysDate) {
      const finalTime = format(istDateTime, 'hh:mm a');
      const templateData: string[] = [
        doctorDetails.salutation + ' ' + doctorDetails.firstName,
        patientDetails.firstName + ' ' + patientDetails.lastName,
        finalTime,
      ];
      sendDoctorNotificationWhatsapp(
        ApiConstants.WHATSAPP_DOCTOR_BOOKING_CONFIRMATION,
        doctorDetails.mobileNumber,
        templateData
      );
    }
    const formattedAptDate = format(
      addMinutes(new Date(appointment.appointmentDateTime), +330),
      'yyyy-MM-dd hh:mm a'
    );
    let doctorSMS = ApiConstants.DOCTOR_BOOK_APPOINTMENT_SMS.replace(
      '{0}',
      doctorDetails.firstName
    );
    doctorSMS = doctorSMS.replace('{1}', appointment.displayId.toString());
    doctorSMS = doctorSMS.replace('{2}', patientDetails.firstName);
    doctorSMS = doctorSMS.replace('{3}', formattedAptDate).replace('{4}', doctorDetails.salutation);
    sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);
  }

  //payment pending success
  else if (pushNotificationInput.notificationType == NotificationType.PAYMENT_PENDING_SUCCESS) {
    let content = ApiConstants.BOOK_APPOINTMENT_PAYMENT_SUCCESS_BODY.replace(
      '{0}',
      appointment.discountedAmount.toString()
    );
    content = content.replace('{1}', appointment.displayId.toString());
    content = content.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    content = content.replace('{3}', apptDate.toString());

    let smsLink = ApiConstants.BOOK_APPOINTMENT_PAYMENT_SUCCESS_SMS.replace(
      '{0}',
      appointment.discountedAmount.toString()
    );
    smsLink = smsLink.replace('{1}', appointment.displayId.toString());
    smsLink = smsLink.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    smsLink = smsLink.replace('{3}', apptDate.toString());

    if (process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM) {
      const chatroom_sms_link = process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM.replace(
        '{0}',
        appointment.id.toString()
      ); // Replacing the placeholder with appointmentid

      smsLink = smsLink.replace('{5}', chatroom_sms_link);
    } else {
      throw new AphError(AphErrorMessages.SMS_DEEPLINK_APPOINTMENT_CHATROOM_MISSING);
    }

    notificationTitle = ApiConstants.BOOK_APPOINTMENT_PAYMENT_SUCCESS_TITLE;
    notificationBody = content;
    //console.log('mobileNumber===============', patientDetails.mobileNumber);
    //console.log('message==========================', notificationBody);
    //send sms
    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
  }

  //payment pending failure
  else if (pushNotificationInput.notificationType == NotificationType.PAYMENT_PENDING_FAILURE) {
    let content = ApiConstants.BOOK_APPOINTMENT_PAYMENT_FAILURE_BODY.replace(
      '{0}',
      appointment.discountedAmount.toString()
    );
    content = content.replace('{1}', appointment.displayId.toString());
    content = content.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    content = content.replace('{3}', apptDate.toString());

    let smsLink = ApiConstants.BOOK_APPOINTMENT_PAYMENT_FAILURE_SMS.replace(
      '{0}',
      appointment.discountedAmount.toString()
    );
    smsLink = smsLink.replace('{1}', appointment.displayId.toString());
    smsLink = smsLink.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    smsLink = smsLink.replace('{3}', apptDate.toString());
    smsLink = smsLink.replace(
      '{5}',
      process.env.SMS_LINK_BOOK_APOINTMENT ? process.env.SMS_LINK_BOOK_APOINTMENT : ''
    );
    notificationTitle = ApiConstants.BOOK_APPOINTMENT_PAYMENT_FAILURE_TITLE;
    notificationBody = content;
    //console.log('mobileNumber===============', patientDetails.mobileNumber);
    //console.log('message==========================', notificationBody);
    //send sms
    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
  } else if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
    notificationTitle = ApiConstants.CALL_APPOINTMENT_TITLE;
    notificationBody = ApiConstants.CALL_APPOINTMENT_BODY.replace('{0}', patientDetails.firstName);
    notificationBody = notificationBody.replace(
      '{1}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
  } else if (
    pushNotificationInput.notificationType == NotificationType.ACCEPT_RESCHEDULED_APPOINTMENT
  ) {
    notificationTitle = ApiConstants.PATIENT_APPOINTMENT_RESCHEDULE_TITLE;
    notificationBody = ApiConstants.PATIENT_APPOINTMENT_RESCHEDULE_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace('{1}', appointment.displayId.toString());
    notificationBody = notificationBody.replace(
      '{2}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    //const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);
    const apptDate = format(
      addMinutes(new Date(appointment.appointmentDateTime), +330),
      'yyyy-MM-dd HH:mm:ss'
    );
    notificationBody = notificationBody.replace('{3}', apptDate);

    /*let smsLink = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Reschedule Now ' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;*/

    sendNotificationSMS(patientDetails.mobileNumber, notificationBody);
  } else if (
    pushNotificationInput.notificationType == NotificationType.RESCHEDULE_APPOINTMENT_BY_PATIENT
  ) {
    notificationTitle = ApiConstants.DOCTOR_APPOINTMENT_RESCHEDULE_TITLE;
    notificationBody = ApiConstants.DOCTOR_APPOINTMENT_RESCHEDULE_BODY.replace(
      '{0}',
      doctorDetails.firstName
    );
    notificationBody = notificationBody.replace('{1}', appointment.displayId.toString());
    notificationBody = notificationBody.replace(
      '{2}',
      patientDetails.firstName + ' ' + patientDetails.lastName
    );
    const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);
    notificationBody = notificationBody.replace('{3}', format(istDateTime, 'yyyy-MM-dd hh:mm'));
    //sendNotificationSMS(doctorDetails.mobileNumber, notificationBody);

    sendNotificationSMS(doctorDetails.mobileNumber, notificationBody);
    //Send Browser Notification
    sendBrowserNotitication(doctorDetails.id, notificationBody);
  } else if (pushNotificationInput.notificationType == NotificationType.PRESCRIPTION_READY) {
    notificationTitle = ApiConstants.PRESCRIPTION_READY_TITLE;
    notificationBody = ApiConstants.PRESCRIPTION_READY_BODY.replace('{0}', patientDetails.firstName)
      .replace('{1}', doctorDetails.firstName)
      .replace('{2}', appointment.displayId.toString())
      .replace('{3}', format(appointment.appointmentDateTime, 'yyyy-MM-dd'));
    let smsLink = process.env.SMS_LINK ? process.env.SMS_LINK : '';

    smsLink = notificationBody + smsLink;
    //notificationBody = notificationBody + process.env.SMS_LINK ? process.env.SMS_LINK : '';
    sendNotificationSMS(patientDetails.mobileNumber, smsLink);
    //sendNotificationWhatsapp(patientDetails.mobileNumber, smsLink);
  } else if (
    pushNotificationInput.notificationType == NotificationType.APPOINTMENT_PAYMENT_REFUND
  ) {
    const appRefRepo = consultsDb.getCustomRepository(AppointmentRefundsRepository);
    const refundsInfo = await appRefRepo.getRefundsByAppointmentId(appointment);
    if (refundsInfo) {
      notificationTitle = ApiConstants.PAYMENT_REFUND_TITLE;
      notificationBody = ApiConstants.PAYMENT_REFUND_BODY.replace(
        '{0}',
        Number(refundsInfo.refundAmount).toFixed(2)
      );
      notificationBody = notificationBody.replace('{1}', appointment.displayId.toString());
      notificationBody = notificationBody.replace('{2}', refundsInfo.refundId);

      sendNotificationSMS(patientDetails.mobileNumber, notificationBody);
    } else {
      return;
    }
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
      sound: notificationSound,
      android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
    },
    data: {},
  };

  if (pushNotificationInput.notificationType == NotificationType.BOOK_APPOINTMENT) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'Book_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.PAYMENT_PENDING_FAILURE) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'Appointment_Payment_Pending_Failure',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        doctorType: doctorDetails.doctorType,
        doctorId: doctorDetails.id,
        content: notificationBody,
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'Reschedule_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
      },
    };
  }

  if (
    pushNotificationInput.notificationType == NotificationType.DOCTOR_NO_SHOW_INITIATE_RESCHEDULE
  ) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'doctor_Noshow_Reschedule_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.PATIENT_NO_SHOW) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'Patient_Noshow_Reschedule_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.PATIENT_CANCEL_APPOINTMENT) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'Patient_Cancel_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.PRESCRIPTION_READY) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: NotificationType.PRESCRIPTION_READY,
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
        file_id: pushNotificationInput.blobName,
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.DOCTOR_CANCEL_APPOINTMENT) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'Appointment_Canceled',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
        doctorType: 'SENIOR',
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
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'chat_room',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
        doctorType: 'SENIOR',
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.INITIATE_JUNIOR_APPT_SESSION) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'chat_room',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
        doctorType: 'JUNIOR',
      },
    };
  }
  if (pushNotificationInput.notificationType == NotificationType.APPOINTMENT_PAYMENT_REFUND) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
      },
      data: {
        type: 'Appointment_Canceled_Refund',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        content: notificationBody,
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
  //console.log(listOfIds, 'listOfIds');
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
  if (registrationToken.length == 0) return;
  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      notificationResponse = response;
      //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
      const fileName =
        process.env.NODE_ENV +
        '_callnotification_' +
        format(addMinutes(new Date(), +330), 'yyyyMMdd') +
        '.txt';
      let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
      if (process.env.NODE_ENV != 'local') {
        assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
      }
      let content =
        format(addMinutes(new Date(), +330), "yyyy-MM-dd'T'HH:mm:ss'+0530'") +
        '\n apptid: ' +
        pushNotificationInput.appointmentId +
        '\n';
      content += pushNotificationInput.notificationType.toString() + '\n multicastId: ';
      content +=
        response.multicastId.toString() +
        '\n------------------------------------------------------------------------------------\n';
      fs.appendFile(assetsDir + '/' + fileName, content, (err) => {
        if (err) {
          console.log('file saving error', err);
        }
        console.log('notification results saved');
      });
      //}
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log(notificationResponse, 'notificationResponse');

  return notificationResponse;
}

export async function sendReminderNotification(
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
  //if (patientDetails.patientDeviceTokens.length == 0) return;

  let notificationTitle: string = '';
  let notificationBody: string = '';
  //building payload
  let payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {},
  };
  if (pushNotificationInput.notificationType == NotificationType.PHYSICAL_APPT_1) {
    notificationTitle = ApiConstants.APPOINTMENT_REMINDER_15_TITLE;
    notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_1_BODY;
    notificationBody = notificationBody.replace('{1}', doctorDetails.firstName);
    notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Reminder_Appointment_15',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
    const doctorSMS = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_DOCTOR_1_BODY.replace(
      '{0}',
      doctorDetails.firstName
    ).replace('{1}', patientDetails.firstName);

    sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);

    //Send Browser Notification
    sendBrowserNotitication(doctorDetails.id, doctorSMS);
  } else if (pushNotificationInput.notificationType == NotificationType.PHYSICAL_APPT_60) {
    notificationTitle = ApiConstants.APPOINTMENT_REMINDER_15_TITLE;
    notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_60_BODY;
    if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
      //notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_15_BODY;
      if (appointment.hospitalId != '' && appointment.hospitalId != null) {
        const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
        const facilityDets = await facilityRepo.getfacilityDetails(appointment.hospitalId);

        if (!facilityDets) {
          throw new AphError(AphErrorMessages.FACILITY_DETS_NOT_FOUND);
        }

        const facilityDetsString = `${facilityDets.name} ${facilityDets.streetLine1} ${facilityDets.city} ${facilityDets.state}`;

        notificationBody = notificationBody.replace('{2}', facilityDetsString);
      }
    }
    notificationBody = notificationBody.replace('{1}', doctorDetails.firstName);
    notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Reminder_Appointment_15',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
  } else if (pushNotificationInput.notificationType == NotificationType.PHYSICAL_APPT_180) {
    notificationTitle = ApiConstants.APPOINTMENT_REMINDER_15_TITLE;
    notificationBody =
      notificationTitle + ': ' + ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_15_BODY;
    if (appointment.hospitalId != '' && appointment.hospitalId != null) {
      const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
      const facilityDets = await facilityRepo.getfacilityDetails(appointment.hospitalId);
      if (!facilityDets) {
        throw new AphError(AphErrorMessages.FACILITY_DETS_NOT_FOUND);
      }

      const facilityDetsString = `${facilityDets.name} ${facilityDets.streetLine1} ${facilityDets.city} ${facilityDets.state}`;

      notificationBody = notificationBody.replace('{1}', facilityDetsString);
    }
    notificationBody = notificationBody.replace('{0}', doctorDetails.firstName);
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Reminder_Appointment_180',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
  } else if (pushNotificationInput.notificationType == NotificationType.APPOINTMENT_REMINDER_15) {
    notificationTitle = ApiConstants.APPOINTMENT_REMINDER_15_TITLE;
    notificationBody = ApiConstants.APPOINTMENT_REMINDER_15_BODY;
    let diffMins = Math.ceil(
      Math.abs(differenceInMinutes(new Date(), appointment.appointmentDateTime))
    );
    let doctorSMS = ApiConstants.DOCTOR_APPOINTMENT_REMINDER_15_SMS.replace(
      '{0}',
      patientDetails.firstName
    );
    if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
      doctorSMS = ApiConstants.DOCTOR_APPOINTMENT_REMINDER_15_SMS_PHYSICAL.replace(
        '{0}',
        patientDetails.firstName
      );
      notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_15_BODY;
      notificationBody = notificationBody.replace('{0}', doctorDetails.firstName);
      if (appointment.hospitalId != '' && appointment.hospitalId != null) {
        const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
        const facilityDets = await facilityRepo.getfacilityDetails(appointment.hospitalId);
        if (!facilityDets) {
          throw new AphError(AphErrorMessages.FACILITY_DETS_NOT_FOUND);
        }

        const facilityDetsString = `${facilityDets.name} ${facilityDets.streetLine1} ${facilityDets.city} ${facilityDets.state}`;
        notificationBody = notificationBody.replace('{1}', facilityDetsString);
      }
    } else {
      if (diffMins <= 1) {
        diffMins = 1;
        notificationBody = ApiConstants.APPOINTMENT_REMINDER_1_BODY;
        notificationBody = notificationBody.replace('{1}', doctorDetails.displayName);
        notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
      } else {
        notificationBody = notificationBody.replace('{1}', diffMins.toString());
        notificationBody = notificationBody.replace('{0}', doctorDetails.firstName);
      }
    }
    const templateData: string[] = [
      doctorDetails.salutation + ' ' + doctorDetails.firstName,
      patientDetails.firstName + ' ' + patientDetails.lastName,
      '15',
    ];
    sendDoctorNotificationWhatsapp(
      ApiConstants.WHATSAPP_SD_CONSULT_REMINDER_15,
      doctorDetails.mobileNumber,
      templateData
    );

    if (appointment.appointmentType != APPOINTMENT_TYPE.PHYSICAL) {
      payload = {
        notification: {
          title: notificationTitle,
          body: notificationBody,
          sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        },
        data: {
          type: 'Reminder_Appointment_15',
          appointmentId: appointment.id.toString(),
          patientName: patientDetails.firstName,
          doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
          android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
          content: notificationBody,
        },
      };
    }
    //send doctor SMS starts
    if (diffMins <= 1) {
      doctorSMS = ApiConstants.DOCTOR_APPOINTMENT_REMINDER_1_SMS.replace(
        '{0}',
        doctorDetails.fullName
      );
      doctorSMS = doctorSMS.replace('{1}', patientDetails.firstName);
    }
    console.log('doctorSMS=======================', doctorSMS);

    sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);
    //send doctor sms ends
    //Send Browser Notification
    sendBrowserNotitication(doctorDetails.id, doctorSMS);
  } else if (
    pushNotificationInput.notificationType == NotificationType.APPOINTMENT_CASESHEET_REMINDER_15
  ) {
    notificationTitle = ApiConstants.APPOINTMENT_CASESHEET_REMINDER_15_TITLE;
    notificationBody = ApiConstants.APPOINTMENT_CASESHEET_REMINDER_15_BODY;
    if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
      notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_CASESHEET_REMINDER_15_BODY;
    }
    notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Reminder_Appointment_Casesheet_15',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
  } else if (
    pushNotificationInput.notificationType ==
    NotificationType.APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL
  ) {
    notificationTitle = ApiConstants.APPOINTMENT_CASESHEET_REMINDER_15_TITLE;
    notificationBody = ApiConstants.APPOINTMENT_CASESHEET_REMINDER_15_BODY;
    notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Reminder_Appointment_Casesheet_15',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
    if (pushNotificationInput.doctorNotification) {
      const doctorSMS = ApiConstants.DOCTOR_APPOINTMENT_REMINDER_15_SMS.replace(
        '{0}',
        patientDetails.firstName
      );

      sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);
      sendBrowserNotitication(doctorDetails.id, doctorSMS);
    }
  } else if (pushNotificationInput.notificationType == NotificationType.VIRTUAL_REMINDER_15) {
    notificationTitle = ApiConstants.APPOINTMENT_REMINDER_15_TITLE;
    notificationBody = ApiConstants.VIRTUAL_REMINDER_15_BODY;
    notificationBody = notificationBody.replace('{0}', doctorDetails.firstName);
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Reminder_Appointment_15',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
    if (pushNotificationInput.doctorNotification) {
      const doctorSMS = ApiConstants.DOCTOR_APPOINTMENT_REMINDER_15_SMS.replace(
        '{0}',
        patientDetails.firstName
      );
      sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);

      sendBrowserNotitication(doctorDetails.id, doctorSMS);
      const templateData: string[] = [
        doctorDetails.salutation + ' ' + doctorDetails.firstName,
        patientDetails.firstName + ' ' + patientDetails.lastName,
        '15',
      ];
      sendDoctorNotificationWhatsapp(
        ApiConstants.WHATSAPP_SD_CONSULT_REMINDER_15,
        doctorDetails.mobileNumber,
        templateData
      );
    }
    //sendNotificationWhatsapp(patientDetails.mobileNumber, notificationBody);
  } else if (
    pushNotificationInput.notificationType == NotificationType.PATIENT_APPOINTMENT_RESCHEDULE
  ) {
    notificationTitle = ApiConstants.PATIENT_APPOINTMENT_RESCHEDULE_TITLE;
    notificationBody = ApiConstants.PATIENT_APPOINTMENT_RESCHEDULE_BODY.replace(
      '{0}',
      patientDetails.firstName
    );
    notificationBody = notificationBody.replace('{1}', appointment.displayId.toString());
    notificationBody = notificationBody.replace(
      '{2}',
      doctorDetails.firstName + ' ' + doctorDetails.lastName
    );
    //const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);
    const apptDate = format(
      addMinutes(new Date(appointment.appointmentDateTime), +330),
      "yyyy-MM-dd'T'HH:mm:ss'+0530'"
    );
    notificationBody = notificationBody.replace('{3}', apptDate);
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Reschedule-Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
  }

  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();

  if (pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE) {
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
  if (pushNotificationInput.notificationType == NotificationType.APPOINTMENT_REMINDER_15) {
    notificationBody = ApiConstants.APPOINTMENT_REMINDER_15_TITLE + ' ' + notificationBody;
  }
  if (
    pushNotificationInput.notificationType == NotificationType.APPOINTMENT_CASESHEET_REMINDER_15 ||
    pushNotificationInput.notificationType ==
      NotificationType.APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL
  ) {
    if (!(appointment && appointment.id)) {
      throw new AphError(AphErrorMessages.APPOINTMENT_ID_NOT_FOUND);
    }

    if (process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM) {
      const chatroom_sms_link = process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM.replace(
        '{0}',
        appointment.id.toString()
      ); //Replacing the placeholder with appointmentid

      //Final deeplink URL
      notificationBody = notificationBody + ApiConstants.CLICK_HERE + chatroom_sms_link;
    } else {
      throw new AphError(AphErrorMessages.SMS_DEEPLINK_APPOINTMENT_CHATROOM_MISSING);
    }
  }
  //send SMS notification
  if (pushNotificationInput.notificationType != NotificationType.APPOINTMENT_REMINDER_15) {
    sendNotificationSMS(patientDetails.mobileNumber, notificationBody);
  }
  if (registrationToken.length == 0) return;
  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      notificationResponse = response;
      //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
      const fileName =
        process.env.NODE_ENV +
        '_callremindernotification_' +
        format(new Date(), 'yyyyMMdd') +
        '.txt';
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
      //}
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log(notificationResponse, 'notificationResponse');
  return notificationResponse;
}

export const sendBrowserNotitication = (id: string, message: string) => {
  const pubnub = new Pubnub({
    publishKey: process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '',
    subscribeKey: process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '',
  });
  pubnub.subscribe({
    channels: [id],
  });
  pubnub.publish(
    {
      channel: id,
      message: {
        id: id,
        message: message,
        messageDate: new Date(),
        sentBy: ApiConstants.SENT_BY_API,
      },
      storeInHistory: false,
      sendByPost: true,
    },
    (status, response) => {
      console.log('status,response==', status, response);
      pubnub.unsubscribe({
        channels: [id],
      });
    }
  );
};

export async function sendCartNotification(
  pushNotificationInput: CartPushNotificationInput,
  patientsDb: Connection
) {
  let notificationTitle: string = '';
  let notificationBody: string = '';
  let type: string = '';

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
    notificationBody = ApiConstants.CART_READY_BODY;
    type = 'Cart_Ready';
  } else if (pushNotificationInput.notificationType == NotificationType.MEDICINE_ORDER_CONFIRMED) {
    notificationTitle = ApiConstants.ORDER_CONFIRMED_TITLE;
    notificationBody = ApiConstants.ORDER_CONFIRMED_BODY;
    type = 'Order_Confirmed';
    const orderTat = medicineOrderDetails.orderTat
      ? medicineOrderDetails.orderTat.toString()
      : 'few';
    let tatDate;
    if (medicineOrderDetails.orderTat) {
      if (Date.parse(orderTat)) {
        tatDate = new Date(orderTat);
      }
    }
    const atOrederDateTime = tatDate ? 'by ' + format(tatDate, 'EEE MMM dd yyyy hh:mm bb') : 'soon';
    notificationBody = notificationBody.replace('{2}', atOrederDateTime);
  }
  notificationBody = notificationBody.replace('{0}', patientDetails.firstName);
  notificationBody = notificationBody.replace('{1}', pushNotificationInput.orderAutoId.toString());

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
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type,
      orderId: pushNotificationInput.orderAutoId.toString(),
      orderAutoId: '',
      deliveredDate: '',
      firstName: patientDetails.firstName,
      content: notificationBody,
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
  if (registrationToken.length == 0) return;
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
  patientsDb: Connection,
  registrationCode: string
) {
  //get all the patient device tokens
  let patientDeviceTokens: string[] = [];
  patientDeviceTokens = await getPatientDeviceTokens(patient.mobileNumber, patientsDb);
  //notification payload
  const notificationTitle = ApiConstants.PATIENT_REGISTRATION_TITLE.toString();
  let notificationBody: string = '';
  notificationBody = ApiConstants.PATIENT_REGISTRATION_BODY.replace('{0}', patient.firstName);
  let smsContent = process.env.SMS_LINK ? ' Click here ' + process.env.SMS_LINK : '';
  smsContent = notificationBody + smsContent;
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type: 'Registration_Success',
      patientId: patient.id,
      firstName: patient.firstName,
      content: notificationBody,
    },
  };
  //let smsContent = notificationBody;
  if (registrationCode != '') {
    smsContent = ApiConstants.PATIENT_REGISTRATION_CODE_BODY.replace('{0}', patient.firstName);
    smsContent = smsContent.replace('{1}', registrationCode);
  }
  //call sendNotificationSMS function to send sms
  await sendNotificationSMS(patient.mobileNumber, smsContent ? smsContent : '');
  if (patientDeviceTokens.length == 0) return;

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
  let smsBody: string = '';
  let payloadDataType: string = '';

  switch (notificationType) {
    case NotificationType.MEDICINE_ORDER_PLACED:
      payloadDataType = 'Order_Placed';
      notificationTitle = ApiConstants.ORDER_PLACED_TITLE;
      notificationBody = ApiConstants.ORDER_PLACED_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY:
      payloadDataType = 'Order_Out_For_Delivery';
      notificationTitle = ApiConstants.ORDER_OUT_FOR_DELIVERY_TITLE;
      notificationBody = ApiConstants.ORDER_OUT_FOR_DELIVERY_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_READY_AT_STORE:
      payloadDataType = 'Order_ready_at_store';
      notificationTitle = ApiConstants.ORDER_READY_AT_STORE_TITLE;
      notificationBody = ApiConstants.ORDER_READY_AT_STORE_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_DELIVERED:
      payloadDataType = 'Order_Delivered';
      notificationTitle = ApiConstants.ORDER_DELIVERY_TITLE;
      notificationBody = ApiConstants.ORDER_DELIVERY_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_PICKEDUP:
      payloadDataType = 'Order_pickedup';
      notificationTitle = ApiConstants.ORDER_PICKEDUP_TITLE;
      notificationBody = ApiConstants.ORDER_PICKEDUP_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_PAYMENT_FAILED:
      payloadDataType = 'Order_Payment_Failed';
      notificationTitle = ApiConstants.MEDICINE_ORDER_PAYMENT_FAILED_TITLE;
      notificationBody = ApiConstants.MEDICINE_ORDER_PAYMENT_FAILED_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_BILL_CHANGED:
      payloadDataType = 'Order_bill_changed';
      notificationTitle = ApiConstants.MEDICINE_ORDER_CHANGED_TITLE;
      notificationBody = ApiConstants.MEDICINE_ORDER_CHANGED_BODY;
      smsBody = ApiConstants.MEDICINE_ORDER_CHANGED_SMS_BODY;
      break;
    default:
      payloadDataType = 'Order_Placed';
      notificationTitle = ApiConstants.ORDER_PLACED_TITLE;
      notificationBody = ApiConstants.ORDER_PLACED_BODY;
  }
  //notification payload
  const userName = patientDetails.firstName ? patientDetails.firstName.trim() : 'User';
  const orderNumber = orderDetails.orderAutoId ? orderDetails.orderAutoId.toString() : '';

  notificationTitle = notificationTitle.toString();
  notificationBody = notificationBody.replace('{0}', userName);
  notificationBody = notificationBody.replace(/\{1}/g, orderNumber);

  if (notificationType == NotificationType.MEDICINE_ORDER_READY_AT_STORE) {
    const shopAddress = JSON.parse(orderDetails.shopAddress);
    notificationBody = notificationBody.replace('{2}', shopAddress.storename);
    notificationBody = notificationBody.replace('{3}', shopAddress.phone);
  }
  if (smsBody) {
    smsBody = smsBody.replace('{0}', userName);
    smsBody = smsBody.replace(/\{1}/g, orderNumber);
  } else {
    smsBody = notificationBody;
  }

  console.log(notificationBody, smsBody, notificationType, 'med orders');
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type: payloadDataType,
      orderAutoId: orderDetails.orderAutoId.toString(),
      orderId: orderDetails.id,
      statusDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
      deliveredDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
      firstName: patientDetails.firstName,
      content: notificationBody,
    },
  };

  //notification options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };

  //send SMS notification
  sendNotificationSMS(patientDetails.mobileNumber, smsBody);

  if (notificationType == NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY) {
    return { status: true };
  }

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

//Notification - Dignostic order Status
export async function sendDiagnosticOrderStatusNotification(
  notificationType: NotificationType,
  orderDetails: DiagnosticOrders,
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
    case NotificationType.DIAGNOSTIC_ORDER_SUCCESS:
      payloadDataType = 'Diagnostic_Order_Success';
      notificationTitle = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_TITLE;
      notificationBody = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_BODY;
      break;
    case NotificationType.DIAGNOSTIC_ORDER_PAYMENT_FAILED:
      payloadDataType = 'Diagnostic_Order_Payment_Failed';
      notificationTitle = ApiConstants.DIAGNOSTIC_ORDER_PAYMENT_FAILED_TITLE;
      notificationBody = ApiConstants.DIAGNOSTIC_ORDER_PAYMENT_FAILED_BODY;
      break;
    default:
      payloadDataType = 'Diagnostic_Order_Success';
      notificationTitle = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_TITLE;
      notificationBody = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_BODY;
  }
  //notification payload
  const userName = patientDetails.firstName ? patientDetails.firstName : 'User';
  const orderNumber = orderDetails.displayId ? orderDetails.displayId.toString() : '';

  notificationTitle = notificationTitle.toString();
  notificationBody = notificationBody.replace('{0}', userName);

  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type: payloadDataType,
      displayId: orderNumber,
      orderId: orderDetails.id,
      firstName: patientDetails.firstName,
      content: notificationBody,
    },
  };

  //notification options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };

  sendNotificationSMS(patientDetails.mobileNumber, notificationBody);
  //initialize firebaseadmin
  const admin = await getInitializedFirebaseAdmin();

  admin
    .messaging()
    .sendToDevice(patientDeviceTokens, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      const logData = {
        patientId: patientDetails.id,
        displayId: orderNumber,
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

const sendDailyAppointmentSummary: Resolver<
  null,
  { docLimit: number; docOffset: number },
  NotificationsServiceContext,
  string
> = async (parent, args, { doctorsDb, consultsDb }) => {
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  //const doctors = await doctorRepo.getAllDoctors('0', args.docLimit, args.docOffset);
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const allAppts = await appointmentRepo.getTodaysAppointments(new Date());
  const countOfNotifications = await new Promise<Number>(async (resolve, reject) => {
    let doctorsCount = 0;
    if (allAppts.length == 0) {
      resolve(doctorsCount);
    }
    let prevDoc = allAppts.length > 0 ? allAppts[0].doctorId : '';
    let onlineAppointments = 0;
    let physicalAppointments = 0;
    const docIds: string[] = [];
    allAppts.forEach((appt) => {
      docIds.push(appt.doctorId);
    });

    const allDoctorDetails = await doctorRepo.getAllDocsById(docIds);
    allAppts.forEach(async (appointment, index, array) => {
      if (appointment.status != STATUS.COMPLETED) {
        if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
          physicalAppointments++;
        } else if (appointment.appointmentType == APPOINTMENT_TYPE.ONLINE) {
          onlineAppointments++;
        }
      }
      if (prevDoc != appointment.doctorId || index + 1 == array.length) {
        const doctorDetails = allDoctorDetails.filter((item) => {
          return item.id == prevDoc;
        });
        if (doctorDetails) {
          const totalAppointments = onlineAppointments + physicalAppointments;
          doctorsCount++;
          const whatsAppLink = process.env.WHATSAPP_LINK_BOOK_APOINTMENT
            ? process.env.WHATSAPP_LINK_BOOK_APOINTMENT
            : '';
          let messageBody = ApiConstants.DAILY_APPOINTMENT_SUMMARY.replace(
            '{0}',
            doctorDetails[0].firstName
          ).replace('{1}', totalAppointments.toString());
          const onlineAppointmentsText =
            onlineAppointments > 0
              ? ApiConstants.ONLINE_APPOINTMENTS.replace('{0}', onlineAppointments.toString())
              : '';
          const physicalAppointmentsText =
            physicalAppointments > 0
              ? ApiConstants.PHYSICAL_APPOINTMENTS.replace('{0}', physicalAppointments.toString())
              : '';
          messageBody += onlineAppointmentsText + physicalAppointmentsText;
          sendBrowserNotitication(doctorDetails[0].id, messageBody);

          sendNotificationSMS(doctorDetails[0].mobileNumber, messageBody);
          const todaysDate = format(addMinutes(new Date(), +330), 'do LLLL');
          const templateData: string[] = [
            todaysDate + ' as of 8 AM',
            whatsAppLink,
            totalAppointments.toString(),
          ];

          sendDoctorNotificationWhatsapp(
            ApiConstants.WHATSAPP_DOC_SUMMARY,
            doctorDetails[0].mobileNumber,
            templateData
          );
          onlineAppointments = 0;
          physicalAppointments = 0;
          prevDoc = appointment.doctorId;
        }
      }

      if (index + 1 === array.length) {
        resolve(doctorsCount);
      }
    });
  });

  return ApiConstants.DAILY_APPOINTMENT_SUMMARY_RESPONSE.replace(
    '{0}',
    countOfNotifications.toString()
  );
};

const sendFollowUpNotification: Resolver<null, {}, NotificationsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb, consultsDb, patientsDb }
) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const previousDate = new Date(addDays(new Date(), -4));
  const appointments = await appointmentRepo.getAllCompletedAppointments(previousDate);
  const count = await sendFollowUpSmsToPatients(appointments, patientsDb, doctorsDb, previousDate);

  return ApiConstants.FOLLOW_UP_NOTIFICATION_RESPONSE.replace('{0}', count.toString());
};

const sendFollowUpSmsToPatients = async (
  appointments: Appointment[],
  patientsDb: Connection,
  doctorsDb: Connection,
  previousDate: Date
) => {
  return new Promise<Number>(async (resolve, reject) => {
    let count = 0;
    appointments.forEach(async (appointment, index, array) => {
      if (!appointment.isFollowUp) {
        const patientRepo = patientsDb.getCustomRepository(PatientRepository);
        const patientDetails = await patientRepo.getPatientDetails(appointment.patientId);
        const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
        const doctorDetails = await doctorRepo.findById(appointment.doctorId);
        if (patientDetails && doctorDetails) {
          const followUpDate = format(addDays(previousDate, +7), 'yyyy-MM-dd');
          const messageBody = ApiConstants.FOLLOWUP_NOTIFITICATION_TEXT.replace(
            '{0}',
            patientDetails.firstName
          )
            .replace('{1}', doctorDetails.firstName)
            .replace('{2}', followUpDate);
          count++;
          sendNotificationSMS(patientDetails.mobileNumber, messageBody);
        }
      }
      if (index + 1 === array.length) {
        resolve(count);
      }
    });
  });
};

export async function sendChatMessageNotification(
  doctorDetails: Doctor,
  patientDetails: Patient,
  appointment: Appointment,
  doctorsDb: Connection,
  chatMessage: string
) {
  const devLink = process.env.CHAT_DOCTOR_DEEP_LINK
    ? process.env.CHAT_DOCTOR_DEEP_LINK + appointment.id
    : '';
  const templateData: string[] = [
    doctorDetails.salutation + ' ' + doctorDetails.firstName,
    patientDetails.firstName + ' ' + patientDetails.lastName,
    devLink,
  ];
  sendDoctorNotificationWhatsapp(
    ApiConstants.WHATSAPP_SD_CHAT_NOTIFICATION_ID,
    doctorDetails.mobileNumber,
    templateData
  );
  const messageBody = ApiConstants.CHAT_MESSGAE_TEXT.replace(
    '{0}',
    doctorDetails.firstName
  ).replace('{1}', patientDetails.firstName);
  await sendNotificationSMS(doctorDetails.mobileNumber, messageBody);
  //sendNotificationWhatsapp(doctorDetails.mobileNumber, messageBody);
  const doctorTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  const deviceTokensList = await doctorTokenRepo.getDeviceTokens(doctorDetails.id);
  //if (deviceTokensList.length == 0) return { status: true };

  const registrationToken: string[] = [];
  if (deviceTokensList.length > 0) {
    //initialize firebaseadmin
    const config = {
      credential: firebaseAdmin.credential.applicationDefault(),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    };
    let admin = require('firebase-admin');
    let notificationResponse: PushNotificationSuccessMessage;
    admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();
    const options = {
      priority: NotificationPriority.high,
      timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
    };
    let chatMsg = '';
    if (chatMessage) {
      chatMsg = chatMessage;
    }
    const payload = {
      notification: {
        title:
          patientDetails.firstName +
          ' sent 1 message | ' +
          format(addMilliseconds(new Date(), 19800000), 'yyyy-MM-dd HH:mm:ss'),
        body: chatMsg,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        title:
          patientDetails.firstName +
          ' sent 1 message | ' +
          format(addMilliseconds(new Date(), 19800000), 'yyyy-MM-dd HH:mm:ss'),
        type: 'doctor_chat_message',
        appointmentId: appointment.id,
        patientName: appointment.patientName,
        body: chatMsg,
      },
    };

    deviceTokensList.forEach((values: { deviceToken: string }) => {
      registrationToken.push(values.deviceToken);
    });

    console.log(registrationToken, 'registrationToken doctor');
    admin
      .messaging()
      .sendToDevice(registrationToken, payload, options)
      .then((response: PushNotificationSuccessMessage) => {
        notificationResponse = response;
        //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV +
          '_doctorapptnotification_' +
          format(new Date(), 'yyyyMMdd') +
          '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          appointment.id.toString() +
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
        //}
        console.log(notificationResponse, 'notificationResponse');
      })
      .catch((error: JSON) => {
        console.log('PushNotification Failed::' + error);
        throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
      });
  }
  return { status: true };
}

const sendChatMessageToDoctor: Resolver<
  null,
  { appointmentId: string; chatMessage: string },
  NotificationsServiceContext,
  SendChatMessageToDoctorResult
> = async (parent, args, { doctorsDb, consultsDb, patientsDb }) => {
  if (!args.appointmentId)
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(args.appointmentId);
  if (!appointment) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointment.patientId);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorDetails = await doctorRepo.findById(appointment.doctorId);
  if (!doctorDetails) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  //const whatsAppLink= process.env.WHATSAPP_LINK_BOOK_APOINTMENT;
  const devLink = process.env.DOCTOR_DEEP_LINK ? process.env.DOCTOR_DEEP_LINK : '';
  const templateData: string[] = [
    doctorDetails.salutation + ' ' + doctorDetails.firstName,
    patientDetails.firstName + ' ' + patientDetails.lastName,
    devLink,
  ];
  sendDoctorNotificationWhatsapp(
    ApiConstants.WHATSAPP_SD_CHAT_NOTIFICATION_ID,
    doctorDetails.mobileNumber,
    templateData
  );
  const messageBody = ApiConstants.CHAT_MESSGAE_TEXT.replace(
    '{0}',
    doctorDetails.firstName
  ).replace('{1}', patientDetails.firstName);
  //await sendNotificationSMS(doctorDetails.mobileNumber, messageBody);

  await sendNotificationSMS(doctorDetails.mobileNumber, messageBody);
  //sendNotificationWhatsapp(doctorDetails.mobileNumber, messageBody);
  const doctorTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  const deviceTokensList = await doctorTokenRepo.getDeviceTokens(appointment.doctorId);
  //if (deviceTokensList.length == 0) return { status: true };

  const registrationToken: string[] = [];
  if (deviceTokensList.length > 0) {
    //initialize firebaseadmin
    const config = {
      credential: firebaseAdmin.credential.applicationDefault(),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    };
    let admin = require('firebase-admin');
    let notificationResponse: PushNotificationSuccessMessage;
    admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();
    const options = {
      priority: NotificationPriority.high,
      timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
    };
    let chatMsg = '';
    if (args.chatMessage) {
      chatMsg = args.chatMessage;
    }
    const payload = {
      notification: {
        title:
          appointment.patientName +
          ' sent 1 message | ' +
          format(addMilliseconds(new Date(), 19800000), 'yyyy-MM-dd HH:mm:ss'),
        body: chatMsg,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'doctor_chat_message',
        appointmentId: appointment.id,
        patientName: appointment.patientName,
        content: chatMsg,
      },
    };

    deviceTokensList.forEach((values: { deviceToken: string }) => {
      registrationToken.push(values.deviceToken);
    });

    console.log(registrationToken, 'registrationToken doctor');
    admin
      .messaging()
      .sendToDevice(registrationToken, payload, options)
      .then((response: PushNotificationSuccessMessage) => {
        notificationResponse = response;
        //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV +
          '_doctorapptnotification_' +
          format(new Date(), 'yyyyMMdd') +
          '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          appointment.id.toString() +
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
        //}
        console.log(notificationResponse, 'notificationResponse');
      })
      .catch((error: JSON) => {
        console.log('PushNotification Failed::' + error);
        throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
      });
  }
  return { status: true };
};

const sendMessageToMobileNumber: Resolver<
  null,
  { mobileNumber: string; textToSend: string },
  NotificationsServiceContext,
  { status: string; message: string }
> = async (parent, args, { doctorsDb, consultsDb, patientsDb }) => {
  const messageResponse = await sendNotificationSMS(args.mobileNumber, args.textToSend);
  return { status: messageResponse.status, message: messageResponse.message };
};

const sendDoctorReminderNotifications: Resolver<
  null,
  { nextMin: number },
  NotificationsServiceContext,
  SendDoctorApptReminderResult
> = async (parent, args, { doctorsDb, consultsDb, patientsDb }) => {
  let apptsListCount = 0;
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const doctorTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  let notificationResponse: PushNotificationSuccessMessage;
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  //get all appointments
  const apptsList = await apptRepo.getSpecificMinuteBothAppointments(args.nextMin);
  if (apptsList.length > 0) {
    apptsListCount = apptsList.length;
    apptsList.forEach(async (apptId) => {
      //building payload
      const payload = {
        notification: {
          title:
            'Reminder ' +
            (apptId.appointmentType == APPOINTMENT_TYPE.PHYSICAL
              ? 'In-person Appointment'
              : 'Online Appointment'),
          body: `with ${apptId.patientName} at ${format(
            addMilliseconds(apptId.appointmentDateTime, 19800000),
            'yyyy-MM-dd HH:mm:ss'
          )}`,
          sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
        },
        data: {
          title:
            'Reminder ' +
            (apptId.appointmentType == APPOINTMENT_TYPE.PHYSICAL
              ? 'In-person Appointment'
              : 'Online Appointment'),
          type: 'doctor_appointment_reminder',
          appointmentId: apptId.id,
          patientName: apptId.patientName,
          body: `with ${apptId.patientName} at ${format(
            addMilliseconds(apptId.appointmentDateTime, 19800000),
            'yyyy-MM-dd HH:mm:ss'
          )}`,
          date: format(
            addMilliseconds(apptId.appointmentDateTime, 19800000),
            'yyyy-MM-dd HH:mm:ss'
          ),
        },
      };
      console.log('payload==========>', payload);

      const deviceTokensList = await doctorTokenRepo.getDeviceTokens(apptId.doctorId);
      //if (deviceTokensList.length == 0) return { status: true };

      const registrationToken: string[] = [];
      if (deviceTokensList.length > 0) {
        deviceTokensList.forEach((values) => {
          registrationToken.push(values.deviceToken);
        });

        console.log(registrationToken, 'registrationToken doctor');
        admin
          .messaging()
          .sendToDevice(registrationToken, payload, options)
          .then((response: PushNotificationSuccessMessage) => {
            notificationResponse = response;
            //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
            const fileName =
              process.env.NODE_ENV +
              '_doctorapptnotification_' +
              format(new Date(), 'yyyyMMdd') +
              '.txt';
            let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
            if (process.env.NODE_ENV != 'local') {
              assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
            }
            let content =
              format(new Date(), 'yyyy-MM-dd hh:mm') +
              '\n apptid: ' +
              apptId.id.toString() +
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
            //}
          })
          .catch((error: JSON) => {
            console.log('PushNotification Failed::' + error);
            throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
          });

        console.log(notificationResponse, 'notificationResponse');
      }
    });
  }
  return { status: true, apptsListCount };
};

export async function sendDoctorAppointmentNotification(
  appointmentDateTime: Date,
  patientName: string,
  apptId: string,
  doctorId: string,
  doctorsDb: Connection
) {
  console.log('doctor appt notification begin');
  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  let notificationResponse: PushNotificationSuccessMessage;
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  //building payload
  const payload = {
    notification: {
      title: 'A New Appointment is scheduled with ' + patientName,
      body: `at ${format(addMilliseconds(appointmentDateTime, 19800000), 'yyyy-MM-dd HH:mm:ss')}`,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      title: 'A New Appointment is scheduled with ' + patientName,
      type: 'doctor_new_appointment_booked',
      appointmentId: apptId,
      patientName: patientName,
      date: format(addMilliseconds(appointmentDateTime, 19800000), 'yyyy-MM-dd HH:mm:ss'),
      body: `at ${format(addMilliseconds(appointmentDateTime, 19800000), 'yyyy-MM-dd HH:mm:ss')}`,
    },
  };
  const doctorTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  const deviceTokensList = await doctorTokenRepo.getDeviceTokens(doctorId);
  //if (deviceTokensList.length == 0) return { status: true };

  const registrationToken: string[] = [];
  if (deviceTokensList.length > 0) {
    deviceTokensList.forEach((values) => {
      registrationToken.push(values.deviceToken);
    });

    console.log(registrationToken, 'registrationToken doctor');
    admin
      .messaging()
      .sendToDevice(registrationToken, payload, options)
      .then((response: PushNotificationSuccessMessage) => {
        notificationResponse = response;
        //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV +
          '_doctorapptnotification_' +
          format(new Date(), 'yyyyMMdd') +
          '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          apptId.toString() +
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
        //}
        console.log(notificationResponse, 'notificationResponse');
      })
      .catch((error: JSON) => {
        console.log('PushNotification Failed::' + error);
        throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
      });
  }
  console.log('doctor appt notification end');
  return { status: true };
}

export async function sendDoctorRescheduleAppointmentNotification(
  appointmentDateTime: Date,
  patientName: string,
  apptId: string,
  doctorId: string,
  doctorsDb: Connection
) {
  console.log('doctor appt notification begin');
  //initialize firebaseadmin
  const config = {
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  };
  let admin = require('firebase-admin');
  let notificationResponse: PushNotificationSuccessMessage;
  admin = !firebaseAdmin.apps.length ? firebaseAdmin.initializeApp(config) : firebaseAdmin.app();
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };
  //building payload
  const apptDate = format(
    addMinutes(new Date(appointmentDateTime), +330),
    "yyyy-MM-dd'T'HH:mm:ss'+0530'"
  );
  const payload = {
    notification: {
      title: `Appointment has been Rescheduled`,
      body: `Appointment with ${patientName} has been rescheduled to ${apptDate}`,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      title: `Appointment has been Rescheduled`,
      type: 'doctor_booked_appointment_reschedule',
      appointmentId: apptId,
      patientName: patientName,
      date: apptDate,
      body: `Appointment with ${patientName} has been rescheduled to ${apptDate}`,
    },
  };

  const doctorTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  const deviceTokensList = await doctorTokenRepo.getDeviceTokens(doctorId);
  //if (deviceTokensList.length == 0) return { status: true };

  const registrationToken: string[] = [];
  if (deviceTokensList.length > 0) {
    deviceTokensList.forEach((values) => {
      registrationToken.push(values.deviceToken);
    });

    console.log(registrationToken, 'registrationToken doctor');
    admin
      .messaging()
      .sendToDevice(registrationToken, payload, options)
      .then((response: PushNotificationSuccessMessage) => {
        notificationResponse = response;
        //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV +
          '_doctorapptnotification_' +
          format(new Date(), 'yyyyMMdd') +
          '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          apptId.toString() +
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
        //}
        console.log(notificationResponse, 'notificationResponse');
      })
      .catch((error: JSON) => {
        console.log('PushNotification Failed::' + error);
        throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
      });
  }
  console.log('doctor appt notification end');
  return { status: true };
}

export async function medicineOrderRefundNotification(
  orderDetails: MedicineOrders,
  medicineOrderRefundNotificationInput: MedicineOrderRefundNotificationInput,
  patientsDb: Connection
) {
  let notificationBody: string = '';
  const {
    paymentInfo,
    isPartialRefund,
    isRefundSuccessful,
    reasonCode,
    healthCreditsRefunded,
    refundAmount,
  } = medicineOrderRefundNotificationInput;

  /**
   * If partial refund happens, it means order is not cancelled but billing amount is less
   * Otherwise, order was cancelled and user should have been refunded
   */
  if (isPartialRefund === true) {
    if ((refundAmount > 0 && isRefundSuccessful) || healthCreditsRefunded > 0) {
      if (refundAmount > 0 && isRefundSuccessful && healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_PAYMENT_HC_PARTIAL_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refundAmount}', refundAmount.toString());
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      } else if (refundAmount > 0 && isRefundSuccessful) {
        notificationBody = ApiConstants.ORDER_PAYMENT_PARTIAL_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refundAmount}', refundAmount.toString());
      } else if (healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_HC_PARTIAL_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      }
      await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
    }
  } else {
    notificationBody = ApiConstants.ORDER_CANCEL_BODY;
    const medicineOrdersRepo = patientsDb.getCustomRepository(MedicineOrdersRepository);
    notificationBody = notificationBody.replace('{name}', orderDetails.patient.firstName);
    notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
    if (reasonCode) {
      const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasonByCode(
        reasonCode
      );
      if (cancellationReasons) {
        notificationBody = notificationBody.replace('{reason}', cancellationReasons.displayMessage);
      } else {
        notificationBody = notificationBody.replace('{reason}', 'Your order has been cancelled');
      }
      await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
    }

    if (
      paymentInfo.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS &&
      ((refundAmount > 0 && isRefundSuccessful) || healthCreditsRefunded > 0)
    ) {
      if (refundAmount > 0 && isRefundSuccessful && healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_CANCEL_PAYMENT_HC_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refund}', refundAmount.toString());
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      } else if (refundAmount > 0 && isRefundSuccessful) {
        notificationBody = ApiConstants.ORDER_CANCEL_PREPAID_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refund}', refundAmount.toString());
      } else if (healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_CANCEL_HC_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      }
      await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
    }
  }
  return;
}

export const getNotificationsResolvers = {
  Query: {
    sendPushNotification,
    testPushNotification,
    sendDailyAppointmentSummary,
    sendFollowUpNotification,
    sendChatMessageToDoctor,
    sendMessageToMobileNumber,
    sendDoctorReminderNotifications,
  },
};
