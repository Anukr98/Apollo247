import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ApiConstants } from 'ApiConstants';
import {
  sendNotification,
  NotificationType,
  sendCallsNotification,
  DOCTOR_CALL_TYPE,
  APPT_CALL_TYPE,
  sendDoctorNotificationWhatsapp,
  sendCallsDisconnectNotification,
} from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentCallDetails, BOOKINGSOURCE, DEVICETYPE } from 'consults-service/entities';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AppointmentCallDetailsRepository } from 'consults-service/repositories/appointmentCallDetailsRepository';
import { format } from 'date-fns';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

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
      sendNotification: Boolean
      doctorId: String
      doctorName: String
      deviceType: DEVICETYPE
      callSource: BOOKINGSOURCE
      appVersion: String
    ): NotificationResult!
    endCallNotification(appointmentCallId: String): EndCallResult!
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
  { appointmentCallId: string },
  ConsultServiceContext,
  EndCallResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const callDetailsRepo = consultsDb.getCustomRepository(AppointmentCallDetailsRepository);
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
    sendNotification: Boolean;
    doctorId: string;
    doctorName: string;
    deviceType: DEVICETYPE;
    callSource: BOOKINGSOURCE;
    appVersion: string;
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
      appointmentCallDetails.id
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
      appointmentCallDetails.id
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
      doctorsDb
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
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.getNotStartedAppointments();
  const devLink = process.env.DOCTOR_DEEP_LINK ? process.env.DOCTOR_DEEP_LINK : '';
  if (apptDetails.length > 0) {
    const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
    apptDetails.forEach(async (appt) => {
      const doctorDetails = await docRepo.findById(appt.doctorId);
      if (doctorDetails) {
        const templateData: string[] = [appt.appointmentType, appt.patientName, devLink];
        sendDoctorNotificationWhatsapp(
          ApiConstants.WHATSAPP_SD_CONSULT_DELAY,
          doctorDetails.doctorSecretary.secretary.mobileNumber,
          templateData
        );
      }
    });
  }
  console.log(apptDetails.length, 'apptDetails.length');
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
