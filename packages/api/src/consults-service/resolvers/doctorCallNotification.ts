import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';

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
  console.log(notificationResult, 'book appt notification');

  return true;
};

export const doctorCallNotificationResolvers = {
  Query: {
    sendCallNotification,
  },
};
