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
> = async (parent, args, { }) => {
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
  //const whatsAppLink = process.env.WHATSAPP_LINK_BOOK_APOINTMENT;
  //const devLink: any = process.env.DOCTOR_DEEP_LINK;
  // const whatsAppMessageBody = ApiConstants.WHATSAPP_SD_CHAT_NOTIFICATION.replace(
  //   '{0}',
  //   doctorDetails.firstName
  // )
  //   .replace('{1}', patientDetails.firstName + ' ' + patientDetails.lastName)
  //   .replace('{2}', doctorDetails.salutation)
  //   .replace('{3}', appointment.id)
  //   .replace('{4}', devLink);
  //whatsAppMessageBody = whatsAppMessageBody;
  //await sendNotificationWhatsapp(doctorDetails.mobileNumber, whatsAppMessageBody, 1);
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

export async function medicineOrderCancelled(
  orderDetails: MedicineOrders,
  reasonCode: string,
  patientsDb: Connection
) {
  let msgText: string = '';
  msgText = ApiConstants.ORDER_CANCEL_BODY;
  const medicineOrdersRepo = patientsDb.getCustomRepository(MedicineOrdersRepository);
  msgText = msgText.replace('{name}', orderDetails.patient.firstName);
  msgText = msgText.replace('{orderId}', orderDetails.orderAutoId.toString());
  const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasonByCode(
    reasonCode
  );
  if (cancellationReasons) {
    msgText = msgText.replace('{reason}', cancellationReasons.displayMessage);
  } else {
    msgText = msgText.replace('{reason}', 'Your order has been cancelled');
  }
  await sendNotificationSMS(orderDetails.patient.mobileNumber, msgText);
  const paymentInfo = orderDetails.medicineOrderPayments[0] || {};
  if (paymentInfo.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS) {
    msgText = ApiConstants.ORDER_CANCEL_PREPAID_BODY;
    msgText = msgText.replace('{orderId}', orderDetails.orderAutoId.toString());
    msgText = msgText.replace('{refund}', paymentInfo.amountPaid.toString());
    await sendNotificationSMS(orderDetails.patient.mobileNumber, msgText);
    if (paymentInfo.healthCreditsRedeemed > 0) {
      msgText = ApiConstants.ORDER_CANCEL_HC_REFUND_BODY;
      msgText = msgText.replace('{orderId}', orderDetails.orderAutoId.toString());
      msgText = msgText.replace(
        '{healthCreditsRefund}',
        paymentInfo.healthCreditsRedeemed.toString()
      );
      await sendNotificationSMS(orderDetails.patient.mobileNumber, msgText);
    }
  }
}

export async function medicineOrderRefundNotification(
  orderDetails: MedicineOrders,
  medicineOrderRefundNotificationInput: MedicineOrderRefundNotificationInput
) {
  let notificationBody: string = '';
  if (
    medicineOrderRefundNotificationInput.refundAmount > 0 ||
    medicineOrderRefundNotificationInput.healthCreditsRefund > 0
  ) {
    if (
      medicineOrderRefundNotificationInput.refundAmount > 0 &&
      medicineOrderRefundNotificationInput.healthCreditsRefund > 0
    ) {
      notificationBody = ApiConstants.ORDER_PAYMENT_HC_PARTIAL_REFUND_BODY;
      notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
      notificationBody = notificationBody.replace(
        '{refundAmount}',
        medicineOrderRefundNotificationInput.refundAmount.toString()
      );
      notificationBody = notificationBody.replace(
        '{healthCreditsRefund}',
        medicineOrderRefundNotificationInput.healthCreditsRefund.toString()
      );
    } else if (medicineOrderRefundNotificationInput.refundAmount > 0) {
      notificationBody = ApiConstants.ORDER_PAYMENT_PARTIAL_REFUND_BODY;
      notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
      notificationBody = notificationBody.replace(
        '{refundAmount}',
        medicineOrderRefundNotificationInput.refundAmount.toString()
      );
    } else if (medicineOrderRefundNotificationInput.healthCreditsRefund > 0) {
      notificationBody = ApiConstants.ORDER_HC_PARTIAL_REFUND_BODY;
      notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
      notificationBody = notificationBody.replace(
        '{healthCreditsRefund}',
        medicineOrderRefundNotificationInput.healthCreditsRefund.toString()
      );
    }
    //console.log(notificationBody);
    await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
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
