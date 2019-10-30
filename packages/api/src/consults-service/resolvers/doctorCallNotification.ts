import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  sendNotification,
  NotificationType,
  sendCallsNotification,
  DOCTOR_CALL_TYPE,
  DOCTOR_TYPE,
} from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { format } from 'date-fns';

export const doctorCallNotificationTypeDefs = gql`
  type NotificationResult {
    status: Boolean!
  }
  type ApptNotificationResult {
    status: Boolean!
    currentTime: String!
  }

  enum DOCTOR_CALL_TYPE {
    AUDIO
    VIDEO
  }

  enum DOCTOR_TYPE {
    JUNIOR
    SENIOR
  }

  extend type Query {
    sendCallNotification(
      appointmentId: String
      callType: DOCTOR_CALL_TYPE
      doctorType: DOCTOR_TYPE
    ): NotificationResult!
    sendApptNotification: ApptNotificationResult!
  }
`;
type NotificationResult = {
  status: Boolean;
};
type ApptNotificationResult = {
  status: Boolean;
  currentTime: string;
};
const sendCallNotification: Resolver<
  null,
  { appointmentId: string; callType: DOCTOR_CALL_TYPE; doctorType: DOCTOR_TYPE },
  ConsultServiceContext,
  NotificationResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.findById(args.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
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
    args.doctorType
  );
  console.log(notificationResult, 'doctor call appt notification');

  return { status: true };
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
  },
};
