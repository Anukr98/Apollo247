import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const doctorCallNotificationTypeDefs = gql`
  extend type Query {
    sendCallNotification(appointmentId: String): Boolean!
  }
`;

const sendCallNotification: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  boolean
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.findById(args.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  const pushNotificationInput = {
    appointmentId: args.appointmentId,
    notificationType: NotificationType.CALL_APPOINTMENT,
  };
  const notificationResult = sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'doctor call appt notification');

  return true;
};

export const doctorCallNotificationResolvers = {
  Query: {
    sendCallNotification,
  },
};
