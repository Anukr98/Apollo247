import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, REQUEST_ROLES } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';

export const cancelAppointmentTypeDefs = gql`
  input CancelAppointmentInput {
    appointmentId: ID!
    cancelReason: String
    cancelledBy: REQUEST_ROLES!
    cancelledById: ID!
  }

  type CancelAppointmentResult {
    status: STATUS
  }

  extend type Mutation {
    cancelAppointment(cancelAppointmentInput: CancelAppointmentInput): CancelAppointmentResult!
  }
`;

type CancelAppointmentResult = {
  status: STATUS;
};

type CancelAppointmentInput = {
  appointmentId: string;
  cancelReason: string;
  cancelledBy: REQUEST_ROLES;
  cancelledById: string;
};

type CancelAppointmentInputArgs = {
  cancelAppointmentInput: CancelAppointmentInput;
};

const cancelAppointment: Resolver<
  null,
  CancelAppointmentInputArgs,
  ConsultServiceContext,
  CancelAppointmentResult
> = async (parent, { cancelAppointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(cancelAppointmentInput.appointmentId);
  if (!appointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  if (appointment.appointmentDateTime <= new Date()) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  if (appointment.status !== STATUS.PENDING && appointment.status !== STATUS.CONFIRMED) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  await appointmentRepo.cancelAppointment(
    cancelAppointmentInput.appointmentId,
    cancelAppointmentInput.cancelledBy,
    cancelAppointmentInput.cancelledById,
    cancelAppointmentInput.cancelReason
  );

  if (cancelAppointmentInput.cancelledBy == REQUEST_ROLES.DOCTOR) {
    const pushNotificationInput = {
      appointmentId: appointment.id,
      notificationType: NotificationType.DOCTOR_CANCEL_APPOINTMENT,
    };
    const notificationResult = sendNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult);
  }

  return { status: STATUS.CANCELLED };
};

export const cancelAppointmentResolvers = {
  Mutation: {
    cancelAppointment,
  },
};
