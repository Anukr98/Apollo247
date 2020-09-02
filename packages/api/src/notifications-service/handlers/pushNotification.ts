import { Connection } from 'typeorm';
import {
  NotificationType,
  NotificationPriority,
  PushNotificationSuccessMessage,
  APPT_CALL_TYPE,
  DOCTOR_CALL_TYPE,
} from 'notifications-service/constants';
import { DEVICE_TYPE } from 'profiles-service/entities';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import {
  addMilliseconds,
  format,
  differenceInMinutes,
  addMinutes,
  differenceInHours,
} from 'date-fns';
import path from 'path';
import fs from 'fs';
import { APPOINTMENT_TYPE, BOOKINGSOURCE } from 'consults-service/entities';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { TransferAppointmentRepository } from 'consults-service/repositories/tranferAppointmentRepository';
import { AppointmentRefundsRepository } from 'consults-service/repositories/appointmentRefundsRepository';

import { ApiConstants } from 'ApiConstants';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { sendNotificationWhatsapp, sendDoctorNotificationWhatsapp } from './whatsApp';
import { checkForValidAppointmentDoctorAndPatient } from './common';
import { sendBrowserNotitication } from './browserNotification';
import { sendNotificationSMS } from './sms';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { hitCallKitCurl } from 'notifications-service/handlers';
import { DoctorDeviceTokenRepository } from 'doctors-service/repositories/doctorDeviceTokenRepository';
import { admin } from 'firebase';
import { log } from 'customWinstonLogger';

type PushNotificationInput = {
  notificationType: NotificationType;
  appointmentId: string;
  doctorNotification?: boolean;
  blobName?: string;
  data?: any
};

type CartPushNotificationInput = {
  notificationType: NotificationType;
  orderAutoId: number;
};

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
    && (!numberOfParticipants || (numberOfParticipants && numberOfParticipants < 2))
  ) {
    hitCallKitCurl(
      voipPushtoken[voipPushtoken.length - 1]['deviceVoipPushToken'],
      doctorDetails.displayName,
      appointment.id,
      patientDetails.id,
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
        patientName: patientDetails.firstName,
        callType: callType,
        appointmentCallId: appointmentCallId,
        doctorType: doctorType,
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
export async function sendReminderNotification(
  pushNotificationInput: PushNotificationInput,
  patientsDb: Connection,
  consultsDb: Connection,
  doctorsDb: Connection
) {
  const { appointmentId } = pushNotificationInput;
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const {
    appointment,
    doctorDetails,
    patientDetails,
  } = await checkForValidAppointmentDoctorAndPatient({
    appointmentId,
    patientsDb,
    doctorsDb,
    consultsDb,
  });
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
export async function sendCallsDisconnectNotification(
  pushNotificationInput: PushNotificationInput,
  patientsDb: Connection,
  consultsDb: Connection,
  doctorsDb: Connection,
  callType: APPT_CALL_TYPE
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

  //building payload
  const payload = {
    data: {
      type: 'call_disconnect',
      appointmentId: appointment.id.toString(),
      doctorName: 'Dr. ' + doctorDetails.firstName,
      callType: callType,
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

export async function sendNotification(
  pushNotificationInput: PushNotificationInput,
  patientsDb: Connection,
  consultsDb: Connection,
  doctorsDb: Connection
) {
  const { appointmentId } = pushNotificationInput;
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const {
    appointment,
    doctorDetails,
    patientDetails,
  } = await checkForValidAppointmentDoctorAndPatient({
    appointmentId,
    patientsDb,
    doctorsDb,
    consultsDb,
  });

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

  // function setMessage({
  // notificationType,
  // doctorSmsBodyParams,
  // patientSmsBodyParams
  // }){
  // prepare sms string
  // }

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
    switch (appointment.bookingSource) {
      case BOOKINGSOURCE.MOBILE:
        if (process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM) {
          const chatroom_sms_link = process.env.SMS_DEEPLINK_APPOINTMENT_CHATROOM.replace(
            '{0}',
            appointment.id.toString()
          );
          smsLink = smsLink.replace('{5}', chatroom_sms_link);
        } else {
          throw new AphError(AphErrorMessages.SMS_DEEPLINK_APPOINTMENT_CHATROOM_MISSING);
        }
        break;
      case BOOKINGSOURCE.WEB:
        if (process.env.SMS_WEBLINK_APPOINTMENT_CHATROOM) {
          const chatroom_sms_link = process.env.SMS_WEBLINK_APPOINTMENT_CHATROOM.replace(
            '{0}',
            appointment.id.toString()
          ).replace(
            '{1}',
            appointment.doctorId.toString()
          );
          smsLink = smsLink.replace('{5}', chatroom_sms_link);
        } else {
          throw new AphError(AphErrorMessages.SMS_WEBLINK_APPOINTMENT_CHATROOM_MISSING);
        }
      default:
        return;
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
    let doctorSMS = ApiConstants.DOCTOR_BOOK_APPOINTMENT_SMS.replace(
      '{0}',
      doctorDetails.firstName
    );
    doctorSMS = doctorSMS.replace('{1}', appointment.displayId.toString());
    doctorSMS = doctorSMS.replace('{2}', patientDetails.firstName);
    doctorSMS = doctorSMS
      .replace('{3}', apptDate.toString())
      .replace('{4}', doctorDetails.salutation);
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


    if (!process.env.DEEPLINK_PRESCRIPTION) {
      log('notificationServiceLogger', AphErrorMessages.DEEPLINK_PRESCRIPTION_MISSING, 'pushNotifications.ts/sendNotification', '', AphErrorMessages.DEEPLINK_PRESCRIPTION_MISSING);
      throw new AphError(AphErrorMessages.DEEPLINK_PRESCRIPTION_MISSING, undefined, undefined);
    }

    let prescriptionDeeplink: string = process.env.DEEPLINK_PRESCRIPTION;

    const { caseSheetId = null } = pushNotificationInput.data;
    if (!caseSheetId) {
      throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID, undefined, undefined);
    }

    prescriptionDeeplink = `${notificationBody} ${ApiConstants.PRESCRIPTION_CLICK_HERE} ${prescriptionDeeplink.replace(ApiConstants.PRESCRIPTION_DEEPLINK_PLACEHOLDER, caseSheetId)}`;

    log(`consultServiceLogger`, `FinalDeeplink: ${prescriptionDeeplink}`, `${NotificationType.PRESCRIPTION_READY}`, '', '');
    console.log(`FinalDeeplink: ${prescriptionDeeplink}`);
    sendNotificationSMS(patientDetails.mobileNumber, prescriptionDeeplink);

    // not sending whatsapp, leaving code here for future implementation purposes
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
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
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

export async function sendDoctorAppointmentNotification(
  appointmentDateTime: Date,
  patientName: string,
  apptId: string,
  doctorId: string,
  doctorsDb: Connection
) {
  console.log('doctor appt notification begin');
  //initialize firebaseadmin

  let notificationResponse: PushNotificationSuccessMessage;
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
        console.log(JSON.stringify(notificationResponse, null, 1), 'notificationResponse');
      })
      .catch((error: JSON) => {
        console.log('PushNotification Failed::' + JSON.stringify(error));
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

  let notificationResponse: PushNotificationSuccessMessage;
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
