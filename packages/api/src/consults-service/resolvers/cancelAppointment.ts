import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { TRANSFER_INITIATED_TYPE, STATUS } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const cancelAppointmentTypeDefs = gql`
  input CancelAppointmentInput {
    appointmentId: ID!
    cancelReason: String
    cancelledBy: TRANSFER_INITIATED_TYPE!
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
  cancelledBy: TRANSFER_INITIATED_TYPE;
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
> = async (parent, { cancelAppointmentInput }, { consultsDb, doctorsDb, profilesDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(cancelAppointmentInput.appointmentId);
  if (!appointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  if (appointment.status !== STATUS.PENDING && appointment.status !== STATUS.CONFIRMED) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  await appointmentRepo.cancelAppointment(
    cancelAppointmentInput.appointmentId,
    cancelAppointmentInput.cancelledBy,
    cancelAppointmentInput.cancelledById
  );

  return { status: STATUS.CANCELLED };
};

export const cancelAppointmentResolvers = {
  Mutation: {
    cancelAppointment,
  },
};
