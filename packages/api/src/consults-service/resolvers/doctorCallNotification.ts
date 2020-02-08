import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  sendNotification,
  NotificationType,
  sendCallsNotification,
  DOCTOR_CALL_TYPE,
  APPT_CALL_TYPE,
} from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentCallDetails } from 'consults-service/entities';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AppointmentCallDetailsRepository } from 'consults-service/repositories/appointmentCallDetailsRepository';
import { format } from 'date-fns';

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
    ): NotificationResult!
    endCallNotification(appointmentCallId: String): EndCallResult!
    sendApptNotification: ApptNotificationResult!
    getCallDetails(appointmentCallId: String): CallDetailsResult!
  }
`;
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

export const doctorCallNotificationResolvers = {
  Query: {
    sendCallNotification,
    sendApptNotification,
    endCallNotification,
    getCallDetails,
  },
};
