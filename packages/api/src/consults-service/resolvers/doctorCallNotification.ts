import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ApiConstants } from 'ApiConstants';
import {
  sendNotification,
  sendCallsNotification,
  sendDoctorNotificationWhatsapp,
  hitCallKitCurl,
  sendCallsDisconnectNotification,
} from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
import { DOCTOR_CALL_TYPE, APPT_CALL_TYPE } from 'notifications-service/constants';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentCallDetails, BOOKINGSOURCE, DEVICETYPE } from 'consults-service/entities';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AppointmentCallDetailsRepository } from 'consults-service/repositories/appointmentCallDetailsRepository';
import { format } from 'date-fns';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { DEVICE_TYPE } from 'profiles-service/entities';
import path from 'path';
import fs from 'fs';

export const doctorCallNotificationTypeDefs = gql`
  type AppointmentCallDetails {
    id: ID!
    callType: String
    doctorType: String
    startTime: DateTime
    endTime: DateTime
    createdDate: DateTime
    updatedDate: DateTime
  }

  type sendPatientWaitNotificationResult {
    status: Boolean
  }

  type NotificationResult {
    status: Boolean!
    callDetails: AppointmentCallDetails!
  }

  type EndCallResult {
    status: Boolean!
  }

  type ApptNotificationResult {
    status: Boolean!
    currentTime: String!
  }

  enum APPT_CALL_TYPE {
    AUDIO
    VIDEO
    CHAT
  }

  enum DOCTOR_CALL_TYPE {
    JUNIOR
    SENIOR
  }

  type CallDetailsResult {
    appointmentCallDetails: AppointmentCallDetails
  }

  extend type Query {
    sendCallNotification(
      appointmentId: String
      callType: APPT_CALL_TYPE
      doctorType: DOCTOR_CALL_TYPE
      numberOfParticipants: Int
      sendNotification: Boolean
      doctorId: String
      doctorName: String
      deviceType: DEVICETYPE
      callSource: BOOKINGSOURCE
      appVersion: String
      patientId: String
      isDev: Boolean
    ): NotificationResult!
    endCallNotification(appointmentCallId: String, isDev: Boolean, patientId: String, numberOfParticipants: Int): EndCallResult!
    sendApptNotification: ApptNotificationResult!
    getCallDetails(appointmentCallId: String): CallDetailsResult!
    sendPatientWaitNotification(appointmentId: String): sendPatientWaitNotificationResult
    sendCallDisconnectNotification(appointmentId: String, callType: APPT_CALL_TYPE): EndCallResult!
    sendCallStartNotification: EndCallResult!
  }
`;
type sendPatientWaitNotificationResult = {
  status: boolean;
};

type NotificationResult = {
  status: Boolean;
  callDetails: AppointmentCallDetails;
};
type ApptNotificationResult = {
  status: Boolean;
  currentTime: string;
};
type EndCallResult = {
  status: Boolean;
};

type CallDetailsResult = {
  appointmentCallDetails: AppointmentCallDetails;
};

const endCallNotification: Resolver<
  null,
  { appointmentCallId: string; isDev: boolean, patientId: string, numberOfParticipants: number },
  ConsultServiceContext,
  EndCallResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const callDetailsRepo = consultsDb.getCustomRepository(AppointmentCallDetailsRepository);
  const callDetails = await callDetailsRepo.getCallDetails(args.appointmentCallId);
  if (!callDetails) {
    throw new AphError(AphErrorMessages.INVALID_CALL_ID, undefined, {});
  }

  let doctorName = callDetails.doctorName;
  if (!doctorName) {
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctor = await doctorRepo.findById(callDetails.appointment.doctorId);
    if (!doctor) {
      throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {});
    }
    doctorName = doctor.displayName;
  }

  args.patientId = args.patientId || callDetails.appointment.patientId;
  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);
  let voipPushtoken = await deviceTokenRepo.getDeviceVoipPushToken(
    args.patientId,
    DEVICE_TYPE.IOS
  );

  if(args.patientId != callDetails.appointment.patientId && (!voipPushtoken.length || !voipPushtoken[voipPushtoken.length - 1]['deviceVoipPushToken'])){
    args.patientId = callDetails.appointment.patientId;
    voipPushtoken = await deviceTokenRepo.getDeviceVoipPushToken(
      args.patientId,
      DEVICE_TYPE.IOS
    );
  }

  if (!args.isDev) {
    args.isDev = false;
  }

  if (voipPushtoken.length && voipPushtoken[voipPushtoken.length - 1]['deviceVoipPushToken'] &&
  (!args.numberOfParticipants || (args.numberOfParticipants && args.numberOfParticipants < 2))) {
    hitCallKitCurl(
      voipPushtoken[voipPushtoken.length - 1]['deviceVoipPushToken'],
      doctorName,
      callDetails.appointment.id,
      args.patientId,
      false,
      APPT_CALL_TYPE.AUDIO,
      args.isDev
    );
  }

  await callDetailsRepo.updateCallDetails(args.appointmentCallId);
  return { status: true };
};

const getCallDetails: Resolver<
  null,
  { appointmentCallId: string },
  ConsultServiceContext,
  CallDetailsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const callDetailsRepo = consultsDb.getCustomRepository(AppointmentCallDetailsRepository);
  const appointmentCallDetails = await callDetailsRepo.getCallDetails(args.appointmentCallId);
  if (!appointmentCallDetails) {
    throw new AphError(AphErrorMessages.INVALID_CALL_ID, undefined, {});
  }
  return { appointmentCallDetails };
};

const sendCallNotification: Resolver<
  null,
  {
    appointmentId: string;
    callType: APPT_CALL_TYPE;
    doctorType: DOCTOR_CALL_TYPE;
    numberOfParticipants: number;
    sendNotification: Boolean;
    doctorId: string;
    doctorName: string;
    deviceType: DEVICETYPE;
    callSource: BOOKINGSOURCE;
    appVersion: string;
    patientId: string;
    isDev: boolean;
  },
  ConsultServiceContext,
  NotificationResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.findById(args.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  const callDetailsRepo = consultsDb.getCustomRepository(AppointmentCallDetailsRepository);
  const appointmentCallDetailsAttrs: Partial<AppointmentCallDetails> = {
    appointment: apptDetails,
    callType: args.callType,
    doctorType: args.doctorType,
    startTime: new Date(),
    doctorId: args.doctorId,
    doctorName: args.doctorName,
    deviceType: args.deviceType,
    callSource: args.callSource,
    appVersion: args.appVersion,
  };
  const appointmentCallDetails = await callDetailsRepo.saveAppointmentCallDetails(
    appointmentCallDetailsAttrs
  );

  if (!args.isDev) {
    args.isDev = false;
  }

  if (args.callType != APPT_CALL_TYPE.CHAT) {
    const pushNotificationInput = {
      appointmentId: args.appointmentId,
      notificationType: NotificationType.CALL_APPOINTMENT,
    };
    const notificationResult = sendCallsNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb,
      args.callType,
      args.doctorType,
      appointmentCallDetails.id,
      args.isDev,
      args.numberOfParticipants,
      args.patientId,
    );
    console.log(notificationResult, 'doctor call appt notification');
  } else {
    const pushNotificationInput = {
      appointmentId: args.appointmentId,
      notificationType: NotificationType.WHATSAPP_CHAT_NOTIFICATION,
    };
    const notificationResult = sendCallsNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb,
      args.callType,
      args.doctorType,
      appointmentCallDetails.id,
      args.isDev,
      args.numberOfParticipants,
      args.patientId,
    );
    console.log(notificationResult, 'doctor call appt notification');
  }
  return { status: true, callDetails: appointmentCallDetails };
};

const sendApptNotification: Resolver<
  null,
  {},
  ConsultServiceContext,
  ApptNotificationResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptsList = await apptRepo.getNextMinuteAppointments();
  console.log(apptsList);
  if (apptsList.length > 0) {
    apptsList.map((appt) => {
      const pushNotificationInput = {
        appointmentId: appt.id,
        notificationType: NotificationType.CALL_APPOINTMENT,
      };
      const notificationResult = sendNotification(
        pushNotificationInput,
        patientsDb,
        consultsDb,
        doctorsDb
      );
      console.log(notificationResult, 'doctor call appt notification');
    });
  }

  return { status: true, currentTime: format(new Date(), 'yyyy-MM-dd hh:mm') };
};
const sendPatientWaitNotification: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  sendPatientWaitNotificationResult
> = async (parent, args, { doctorsDb, consultsDb, patientsDb }) => {
  if (!args.appointmentId)
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(args.appointmentId);
  if (!appointment) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorDetails = await doctorRepo.findById(appointment.doctorId);
  if (!doctorDetails) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  //const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  //const patientDetails = await patientRepo.getPatientDetails(appointment.patientId);
  //if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);
  //const applicationLink = process.env.WHATSAPP_LINK_BOOK_APOINTMENT + '?' + appointment.id;
  const devLink = process.env.DOCTOR_DEEP_LINK ? process.env.DOCTOR_DEEP_LINK : '';
  if (appointment) {
    const templateData: string[] = [appointment.appointmentType, appointment.patientName, devLink];
    sendDoctorNotificationWhatsapp(
      ApiConstants.WHATSAPP_SD_CONSULT_DELAY,
      doctorDetails.mobileNumber,
      templateData
    );
  }
  return { status: true };
};

const sendCallDisconnectNotification: Resolver<
  null,
  {
    appointmentId: string;
    callType: APPT_CALL_TYPE;
  },
  ConsultServiceContext,
  EndCallResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.findById(args.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  if (args.callType != APPT_CALL_TYPE.CHAT) {
    const pushNotificationInput = {
      appointmentId: args.appointmentId,
      notificationType: NotificationType.CALL_APPOINTMENT,
    };
    const notificationResult = sendCallsDisconnectNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb,
      args.callType
    );
    console.log(notificationResult, 'doctor call appt notification');
  }
  return { status: true };
};

const sendCallStartNotification: Resolver<null, {}, ConsultServiceContext, EndCallResult> = async (
  parent,
  args,
  { consultsDb, doctorsDb }
) => {
  let content = '\n-----------------\n' + format(new Date(), 'yyyy-MM-dd HH:mm');
  const fileName =
    process.env.NODE_ENV + '_docsecretarytnotification_' + format(new Date(), 'yyyyMMdd') + '.txt';
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.getNotStartedAppointments();
  const devLink = process.env.DOCTOR_DEEP_LINK ? process.env.DOCTOR_DEEP_LINK : '';
  content += '\nappts length: ' + apptDetails.length.toString();
  fs.appendFile(assetsDir + '/' + fileName, content, (err) => {});
  if (apptDetails.length > 0) {
    const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
    apptDetails.forEach(async (appt) => {
      content += '\n apptId: ' + appt.id + ' - ' + appt.doctorId;
      const doctorDetails = await docRepo.getDoctorSecretary(appt.doctorId);
      if (doctorDetails) {
        //console.log(doctorDetails.id, doctorDetails.doctorSecretary, 'doc details');
        content +=
          doctorDetails.id + '-' + doctorDetails.doctorSecretary.secretary.mobileNumber + '\n';
        fs.appendFile(assetsDir + '/' + fileName, content, (err) => {});
        const templateData: string[] = [appt.appointmentType, appt.patientName, devLink];
        sendDoctorNotificationWhatsapp(
          ApiConstants.WHATSAPP_SD_CONSULT_DELAY,
          doctorDetails.doctorSecretary.secretary.mobileNumber,
          templateData
        );
      }
    });
  }
  return { status: true };
};

export const doctorCallNotificationResolvers = {
  Query: {
    sendCallNotification,
    sendApptNotification,
    endCallNotification,
    getCallDetails,
    sendPatientWaitNotification,
    sendCallDisconnectNotification,
    sendCallStartNotification,
  },
};
