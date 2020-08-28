import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { Connection } from 'typeorm';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ApiConstants } from 'ApiConstants';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorDeviceTokenRepository } from 'doctors-service/repositories/doctorDeviceTokenRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { addMilliseconds, format, addDays, addMinutes } from 'date-fns';
import path from 'path';
import fs from 'fs';
import { log } from 'customWinstonLogger';
import { APPOINTMENT_TYPE, Appointment, STATUS } from 'consults-service/entities';
import * as child_process from 'child_process';
import { admin } from 'firebase';
import { NotificationType, NotificationPriority } from 'notifications-service/constants';
import {
  sendNotification,
  sendDoctorNotificationWhatsapp,
  sendNotificationSMS,
  sendBrowserNotitication,
} from 'notifications-service/handlers';

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

export enum APPT_CALL_TYPE {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  CHAT = 'CHAT',
}

export enum DOCTOR_CALL_TYPE {
  SENIOR = 'SENIOR',
  JUNIOR = 'JUNIOR',
}

export type PushNotificationSuccessMessage = {
  results: PushNotificationMessage[];
  canonicalRegistrationTokenCount: number;
  failureCount: number;
  successCount: number;
  multicastId: number;
};

type PushNotificationInput = {
  notificationType: NotificationType;
  appointmentId: string;
  doctorNotification?: boolean;
  blobName?: string;
};

type PushNotificationInputArgs = { pushNotificationInput: PushNotificationInput };

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
  const doctors = await doctorRepo.getAllDoctors('0', args.docLimit, args.docOffset);
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const countOfNotifications = await new Promise<Number>(async (resolve, reject) => {
    let doctorsCount = 0;
    doctors.forEach(async (doctor, index, array) => {
      const appointments = await appointmentRepo.getDoctorAppointments(
        doctor.id,
        new Date(),
        new Date()
      );
      let onlineAppointments = 0;
      let physicalAppointments = 0;
      appointments.forEach((appointment) => {
        if (appointment.status != STATUS.COMPLETED) {
          if (appointment.appointmentType == APPOINTMENT_TYPE.PHYSICAL) {
            physicalAppointments++;
          } else if (appointment.appointmentType == APPOINTMENT_TYPE.ONLINE) {
            onlineAppointments++;
          }
        }
      });

      const totalAppointments = onlineAppointments + physicalAppointments;

      if (totalAppointments > 0) {
        doctorsCount++;
        const whatsAppLink =
          ApiConstants.WHATSAPP_LINK + '' + process.env.WHATSAPP_LINK_BOOK_APOINTMENT;
        let whatsAppMessageBody = ApiConstants.DAILY_WHATSAPP_NOTIFICATION.replace(
          '{0}',
          doctor.firstName
        ).replace('{1}', totalAppointments.toString());
        let messageBody = ApiConstants.DAILY_APPOINTMENT_SUMMARY.replace(
          '{0}',
          doctor.firstName
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
        whatsAppMessageBody +=
          onlineAppointmentsText + '' + physicalAppointmentsText + whatsAppLink;
        sendBrowserNotitication(doctor.id, messageBody);

        sendNotificationSMS(doctor.mobileNumber, messageBody);
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
    let notificationResponse: PushNotificationSuccessMessage;
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
  let notificationResponse: PushNotificationSuccessMessage;
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
