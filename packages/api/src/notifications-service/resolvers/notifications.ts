import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import * as firebaseAdmin from 'firebase-admin';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { Connection } from 'typeorm';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ApiConstants } from 'ApiConstants';
import { Patient, MedicineOrders, DiagnosticOrders } from 'profiles-service/entities';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { TransferAppointmentRepository } from 'consults-service/repositories/tranferAppointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { addMilliseconds, format, differenceInHours, differenceInMinutes } from 'date-fns';
import path from 'path';
import fs from 'fs';
import { log } from 'customWinstonLogger';
import { APPOINTMENT_TYPE } from 'consults-service/entities';

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
  MEDICINE_ORDER_PAYMENT_FAILED = 'MEDICINE_ORDER_PAYMENT_FAILED',
  MEDICINE_ORDER_OUT_FOR_DELIVERY = 'MEDICINE_ORDER_OUT_FOR_DELIVERY',
  MEDICINE_ORDER_DELIVERED = 'MEDICINE_ORDER_DELIVERED',
  DOCTOR_CANCEL_APPOINTMENT = 'DOCTOR_CANCEL_APPOINTMENT',
  PATIENT_REGISTRATION = 'PATIENT_REGISTRATION',
  APPOINTMENT_REMINDER_15 = 'APPOINTMENT_REMINDER_15',
  APPOINTMENT_CASESHEET_REMINDER_15 = 'APPOINTMENT_CASESHEET_REMINDER_15',
  PATIENT_APPOINTMENT_RESCHEDULE = 'PATIENT_APPOINTMENT_RESCHEDULE',
  DIAGNOSTIC_ORDER_SUCCESS = 'DIAGNOSTIC_ORDER_SUCCESS',
  DIAGNOSTIC_ORDER_PAYMENT_FAILED = 'DIAGNOSTIC_ORDER_PAYMENT_FAILED',
  PATIENT_CANCEL_APPOINTMENT = 'PATIENT_CANCEL_APPOINTMENT',
  PHYSICAL_APPT_60 = 'PHYSICAL_APPT_60',
  PHYSICAL_APPT_1 = 'PHYSICAL_APPT_1',
  PATIENT_NO_SHOW = 'PATIENT_NO_SHOW',
  ACCEPT_RESCHEDULED_APPOINTMENT = 'ACCEPT_RESCHEDULED_APPOINTMENT',
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

export const sendNotificationSMS = async (mobileNumber: string, message: string) => {
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

  //get doctor details
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);

  // if (doctorType == DOCTOR_CALL_TYPE.JUNIOR) {
  //   const consultQueueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  //   const queueDetails = await consultQueueRepo.findByAppointmentId(
  //     pushNotificationInput.appointmentId
  //   );
  //   if (queueDetails == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
  //   doctorDetails = await doctorRepo.findById(queueDetails.doctorId);
  // } else {
  //   doctorDetails = await doctorRepo.findById(appointment.doctorId);
  // }
  const doctorDetails = await doctorRepo.findById(appointment.doctorId);
  if (doctorDetails == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
  //check patient existence and get his details
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointment.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //check for registered device tokens
  //if (patientDetails.patientDeviceTokens.length == 0) return;

  //if notiifcation of type reschedule & check for reschedule notification setting
  // if (
  //   patientDetails.patientNotificationSettings &&
  //   pushNotificationInput.notificationType == NotificationType.INITIATE_RESCHEDULE &&
  //   !patientDetails.patientNotificationSettings.reScheduleAndCancellationNotification
  // ) {
  //   return;
  // }

  let notificationTitle: string = '';
  let notificationBody: string = '';
  notificationTitle = ApiConstants.CALL_APPOINTMENT_TITLE;
  notificationBody = ApiConstants.AVCALL_APPOINTMENT_BODY;
  if (doctorType == DOCTOR_CALL_TYPE.JUNIOR) {
    if (callType == APPT_CALL_TYPE.CHAT) {
      notificationBody = ApiConstants.JUNIOR_CALL_APPOINTMENT_BODY;
    } else {
      notificationBody = ApiConstants.JUNIOR_AVCALL_APPOINTMENT_BODY;
    }
  }
  if (callType == APPT_CALL_TYPE.CHAT && doctorType == DOCTOR_CALL_TYPE.SENIOR) {
    notificationBody = ApiConstants.CALL_APPOINTMENT_BODY;
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
  const apptDate = format(istDateTime, 'dd-MM-yyyy HH:mm');
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
    let cancelApptSMS = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Click here' +
        process.env.SMS_LINK_BOOK_APOINTMENT +
        ' ' +
        ApiConstants.PATIENT_CANCEL_APPT_BODY_END
      : '';
    cancelApptSMS = notificationBody + cancelApptSMS;

    console.log('cancelApptSMS======================', cancelApptSMS);
    sendNotificationSMS(patientDetails.mobileNumber, cancelApptSMS ? cancelApptSMS : '');
    //send sms to doctor
    let doctorSMS = ApiConstants.DOCTOR_PATIENT_CANCEL_SMS.replace('{0}', doctorDetails.fullName);
    doctorSMS = doctorSMS.replace('{1}', appointment.displayId.toString());
    doctorSMS = doctorSMS.replace('{2}', patientDetails.firstName);
    doctorSMS = doctorSMS.replace('{3}', apptDate.toString());
    sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);
  } else if (pushNotificationInput.notificationType == NotificationType.DOCTOR_CANCEL_APPOINTMENT) {
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
    let smsLink = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Reschedule Now ' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;

    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
  } else if (pushNotificationInput.notificationType == NotificationType.PATIENT_NO_SHOW) {
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
      ? ' Click here' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;
    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
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
    let content = ApiConstants.BOOK_APPOINTMENT_BODY.replace('{0}', patientDetails.firstName);
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
          content = content.replace(
            '{4}',
            facilityDets.name +
              ' ' +
              facilityDets.streetLine1 +
              ' ' +
              facilityDets.city +
              ' ' +
              facilityDets.state
          );
          smsLink = content.replace(
            '{4}',
            facilityDets.name +
              ' ' +
              facilityDets.streetLine1 +
              ' ' +
              facilityDets.city +
              ' ' +
              facilityDets.state
          );
        }
      }
    }
    content = content.replace('{1}', appointment.displayId.toString());
    content = content.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    content = content.replace('{3}', apptDate.toString());

    smsLink = smsLink.replace('{1}', appointment.displayId.toString());
    smsLink = smsLink.replace('{2}', doctorDetails.firstName + ' ' + doctorDetails.lastName);
    smsLink = smsLink.replace('{3}', apptDate.toString());
    smsLink = smsLink.replace(
      '{5}',
      process.env.SMS_LINK_BOOK_APOINTMENT ? process.env.SMS_LINK_BOOK_APOINTMENT : ''
    );

    notificationTitle = ApiConstants.BOOK_APPOINTMENT_TITLE;
    notificationBody = content;
    console.log('mobileNumber===============', patientDetails.mobileNumber);
    console.log('message==========================', notificationBody);
    //send sms
    sendNotificationSMS(patientDetails.mobileNumber, smsLink ? smsLink : '');
    //send sms to doctor
    let doctorSMS = ApiConstants.DOCTOR_BOOK_APPOINTMENT_SMS.replace('{0}', doctorDetails.fullName);
    doctorSMS = doctorSMS.replace('{1}', appointment.displayId.toString());
    doctorSMS = doctorSMS.replace('{2}', patientDetails.firstName);
    doctorSMS = doctorSMS.replace('{3}', apptDate.toString());
    sendNotificationSMS(doctorDetails.mobileNumber, doctorSMS);
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
    const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);
    notificationBody = notificationBody.replace('{3}', format(istDateTime, 'yyyy-MM-dd hh:mm'));

    /*let smsLink = process.env.SMS_LINK_BOOK_APOINTMENT
      ? ' Reschedule Now ' + process.env.SMS_LINK_BOOK_APOINTMENT
      : '';
    smsLink = notificationBody + smsLink;*/

    sendNotificationSMS(patientDetails.mobileNumber, notificationBody);
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
    },
    data: {},
  };

  if (pushNotificationInput.notificationType == NotificationType.BOOK_APPOINTMENT) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Book_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
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
      },
      data: {
        type: 'Reschedule_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
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
      },
      data: {
        type: 'Patient_Noshow_Reschedule_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
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
      },
      data: {
        type: 'Patient_Cancel_Appointment',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
      },
    };
  }

  if (pushNotificationInput.notificationType == NotificationType.DOCTOR_CANCEL_APPOINTMENT) {
    payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        type: 'Appointment_Canceled',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
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
      },
      data: {
        type: 'chat_room',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
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
      },
      data: {
        type: 'chat_room',
        appointmentId: appointment.id.toString(),
        patientName: patientDetails.firstName,
        doctorName: doctorDetails.firstName + ' ' + doctorDetails.lastName,
        android_channel_id: 'fcm_FirebaseNotifiction_default_channel',
        content: notificationBody,
        doctorType: 'JUNIOR',
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
  if (registrationToken.length == 0) return;
  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      notificationResponse = response;
      //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
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
  } else if (pushNotificationInput.notificationType == NotificationType.PHYSICAL_APPT_60) {
    notificationTitle = ApiConstants.APPOINTMENT_REMINDER_15_TITLE;
    notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_60_BODY;
    if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
      //notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_15_BODY;
      if (appointment.hospitalId != '' && appointment.hospitalId != null) {
        const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
        const facilityDets = await facilityRepo.getfacilityDetails(appointment.hospitalId);
        if (facilityDets) {
          notificationBody = notificationBody.replace(
            '{2}',
            facilityDets.name +
              ' ' +
              facilityDets.streetLine1 +
              ' ' +
              facilityDets.city +
              ' ' +
              facilityDets.state
          );
        }
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
  } else if (pushNotificationInput.notificationType == NotificationType.APPOINTMENT_REMINDER_15) {
    notificationTitle = ApiConstants.APPOINTMENT_REMINDER_15_TITLE;
    notificationBody = ApiConstants.APPOINTMENT_REMINDER_15_BODY;
    let diffMins = Math.ceil(
      Math.abs(differenceInMinutes(new Date(), appointment.appointmentDateTime))
    );
    if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
      notificationBody = ApiConstants.PHYSICAL_APPOINTMENT_REMINDER_15_BODY;
      notificationBody = notificationBody.replace('{0}', doctorDetails.firstName);
      if (appointment.hospitalId != '' && appointment.hospitalId != null) {
        const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
        const facilityDets = await facilityRepo.getfacilityDetails(appointment.hospitalId);
        if (facilityDets) {
          notificationBody = notificationBody.replace(
            '{1}',
            facilityDets.name +
              ' ' +
              facilityDets.streetLine1 +
              ' ' +
              facilityDets.city +
              ' ' +
              facilityDets.state
          );
        }
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
    //send doctor SMS starts
    let doctorSMS = ApiConstants.DOCTOR_APPOINTMENT_REMINDER_15_SMS.replace(
      '{0}',
      patientDetails.firstName
    );
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
    const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);
    notificationBody = notificationBody.replace('{3}', format(istDateTime, 'yyyy-MM-dd hh:mm'));
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
  if (pushNotificationInput.notificationType == NotificationType.APPOINTMENT_REMINDER_15)
    notificationBody = ApiConstants.APPOINTMENT_REMINDER_15_TITLE + ' ' + notificationBody;
  if (
    pushNotificationInput.notificationType == NotificationType.APPOINTMENT_CASESHEET_REMINDER_15
  ) {
    const smsLink = process.env.SMS_LINK ? process.env.SMS_LINK : '';
    notificationBody = notificationBody + ' Click here ' + smsLink;
  }
  //send SMS notification
  sendNotificationSMS(patientDetails.mobileNumber, notificationBody);
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
    sendNotificationSMS(patientDetails.mobileNumber, notificationBody);
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
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type: 'Cart_Ready',
      orderId: pushNotificationInput.orderAutoId.toString(),
      orderAutoId: '',
      deliveredDate: '',
      firstName: patientDetails.firstName,
      content: notificationBody,
    },
  };

  if (pushNotificationInput.notificationType == NotificationType.MEDICINE_ORDER_DELIVERED) {
    payload.data = {
      type: 'Order_Delivered',
      orderAutoId: pushNotificationInput.orderAutoId.toString(),
      orderId: medicineOrderDetails.id,
      deliveredDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
      firstName: patientDetails.firstName,
      content: notificationBody,
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
      break;
    case NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY:
      payloadDataType = 'Order_Out_For_Delivery';
      notificationTitle = ApiConstants.ORDER_OUT_FOR_DELIVERY_TITLE;
      notificationBody = ApiConstants.ORDER_OUT_FOR_DELIVERY_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_PAYMENT_FAILED:
      payloadDataType = 'Order_Payment_Failed';
      notificationTitle = ApiConstants.MEDICINE_ORDER_PAYMENT_FAILED_TITLE;
      notificationBody = ApiConstants.MEDICINE_ORDER_PAYMENT_FAILED_BODY;
      break;
    default:
      payloadDataType = 'Order_Placed';
      notificationTitle = ApiConstants.ORDER_PLACED_TITLE;
      notificationBody = ApiConstants.ORDER_PLACED_BODY;
  }
  //notification payload
  const userName = patientDetails.firstName ? patientDetails.firstName : 'User';
  const orderNumber = orderDetails.orderAutoId ? orderDetails.orderAutoId.toString() : '';
  let orderTat = orderDetails.orderTat ? orderDetails.orderTat.toString() : 'few';
  if (orderDetails.orderTat !== null) {
    if (Date.parse(orderDetails.orderTat.toString())) {
      const tatDate = new Date(orderDetails.orderTat.toString());
      orderTat = Math.floor(Math.abs(differenceInHours(tatDate, new Date()))).toString();
    }
  }

  notificationTitle = notificationTitle.toString();
  notificationBody = notificationBody.replace('{0}', userName);
  notificationBody = notificationBody.replace('{1}', orderNumber);
  notificationBody = notificationBody.replace('{2}', orderTat);
  console.log(notificationBody, notificationType, 'med orders');
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
  sendNotificationSMS(patientDetails.mobileNumber, notificationBody);

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

export const getNotificationsResolvers = {
  Query: { sendPushNotification, testPushNotification },
};
